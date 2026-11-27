import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { hash } from 'bcrypt';
import type { z } from 'zod';
import { PrismaService } from '../prisma.service';
import type { departmentSchema, newUserSchema } from './settings.schema';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings() {
    const departments = await this.prisma.departments.findMany({
      orderBy: { name: 'asc' },
      select: { name: true, description: true },
    });
    return { departments };
  }

  async createDepartment(data: z.infer<typeof departmentSchema>) {
    try {
      return await this.prisma.departments.create({
        data,
        select: { name: true },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Department name already exists');
      }
      throw error;
    }
  }

  async createUser(input: z.infer<typeof newUserSchema>) {
    const { department, password, ...profile } = input;
    try {
      return await this.prisma.users.create({
        data: {
          ...profile,
          password: await hash(password, 12),
          departmentObj: { connect: { name: department } },
        },
        select: { username: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002')
          throw new ConflictException('Username or email already exists');
        if (error.code === 'P2025' || error.code === 'P2003') {
          throw new BadRequestException('Department does not exist');
        }
      }
      throw error;
    }
  }
}
