import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

export const itemPageSize = 50;

@Injectable()
export class ItemsService {
  constructor(private readonly prisma: PrismaService) {}

  async list({ q, unit, page }: { q: string; unit: string; page: number }) {
    const keyword = q.replace(/[\\%_]/g, '\\$&');
    const unitFilter = unit.replace(/[\\%_]/g, '\\$&');
    const items = await this.prisma.items.findMany({
      where: {
        OR: keyword
          ? [
              { item_code: { contains: keyword } },
              { item_name: { contains: keyword } },
            ]
          : undefined,
        unit: unitFilter ? { contains: unitFilter } : undefined,
      },
      orderBy: { item_code: 'asc' },
      skip: (page - 1) * itemPageSize,
      take: itemPageSize + 1,
    });
    return {
      items: items.slice(0, itemPageSize),
      hasMore: items.length > itemPageSize,
    };
  }

  async get(id: number) {
    if (!Number.isSafeInteger(id) || id < 1 || id > 2147483647) {
      throw new NotFoundException('Item not found');
    }
    const item = await this.prisma.items.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Item not found');
    return item;
  }

  async save(data: Prisma.ItemsCreateInput, id?: number) {
    try {
      if (id === undefined) {
        return await this.prisma.items.create({ data });
      }
      if (!Number.isSafeInteger(id) || id < 1 || id > 2147483647) {
        throw new NotFoundException('Item not found');
      }
      return await this.prisma.items.update({ where: { id }, data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002')
          throw new ConflictException('Item code already exists');
        if (error.code === 'P2025')
          throw new NotFoundException('Item not found');
      }
      throw error;
    }
  }
}
