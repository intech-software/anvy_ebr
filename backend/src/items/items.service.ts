import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, type Items } from '@prisma/client';
import { writeAuditLog } from '../audit-logs/write-audit-log';
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

  async save(actorId: number, data: Prisma.ItemsCreateInput, id?: number) {
    if (
      id !== undefined &&
      (!Number.isSafeInteger(id) || id < 1 || id > 2147483647)
    ) {
      throw new NotFoundException('Item not found');
    }
    try {
      return await this.prisma.$transaction(async (tx) => {
        if (id === undefined) {
          const item = await tx.items.create({ data });
          await writeAuditLog(tx, {
            actorId,
            entityType: 'items',
            entityId: item.id,
            entityName: item.item_name,
            action: 'CREATE',
            newValues: item,
          });
          return item;
        }

        const [previous] = await tx.$queryRaw<Items[]>`
          SELECT id, item_code, item_name, unit FROM items WHERE id = ${id} FOR UPDATE
        `;
        if (!previous) throw new NotFoundException('Item not found');
        const item = await tx.items.update({ where: { id }, data });
        if (
          previous.item_code !== item.item_code ||
          previous.item_name !== item.item_name ||
          previous.unit !== item.unit
        ) {
          await writeAuditLog(tx, {
            actorId,
            entityType: 'items',
            entityId: item.id,
            entityName: item.item_name,
            action: 'UPDATE',
            oldValues: previous,
            newValues: item,
          });
        }
        return item;
      });
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
