import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { hash } from 'bcrypt';
import type { z } from 'zod';
import { writeAuditLog } from '../audit-logs/write-audit-log';
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

  async createDepartment(
    actorId: number,
    data: z.infer<typeof departmentSchema>,
  ) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const department = await tx.departments.create({
          data,
          select: { name: true, description: true },
        });
        await writeAuditLog(tx, {
          actorId,
          entityType: 'departments',
          entityId: department.name,
          entityName: department.name,
          action: 'CREATE',
          newValues: department,
        });
        return { name: department.name };
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

  async createUser(actorId: number, input: z.infer<typeof newUserSchema>) {
    const { department, password, ...profile } = input;
    try {
      const passwordHash = await hash(password, 12);
      return await this.prisma.$transaction(async (tx) => {
        const user = await tx.users.create({
          data: {
            ...profile,
            password: passwordHash,
            departmentObj: { connect: { name: department } },
          },
          select: {
            id: true,
            username: true,
            name: true,
            position: true,
            department: true,
          },
        });
        await writeAuditLog(tx, {
          actorId,
          entityType: 'users',
          entityId: user.id,
          entityName: user.name || user.username,
          action: 'CREATE',
          newValues: user,
        });
        return { username: user.username };
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
