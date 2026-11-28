import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { AuditAction, Prisma } from '@prisma/client';
import { AccessControlService } from '../access-control/access-control.service';
import { PrismaService } from '../prisma.service';

export const auditPageSize = 20;

@Injectable()
export class AuditLogsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: AccessControlService,
  ) {}

  async list(
    userId: number,
    filter: {
      page: number;
      keyword?: string;
      entity_type?: string;
      action?: AuditAction;
    },
  ) {
    const access = await this.access.getUserAccess(userId);
    if (!access) throw new UnauthorizedException();
    const canReadAll = access.permissions.has('permissions.list');
    const term = filter.keyword?.replace(/[\\%_]/g, '\\$&');
    const where: Prisma.AuditLogsWhereInput = {
      actor_id: canReadAll ? undefined : userId,
      entity_type: filter.entity_type || undefined,
      action: filter.action,
      OR: term
        ? [
            { entity_id: { contains: term } },
            { entity_name: { contains: term } },
            { actor_name: { contains: term } },
            { reason: { contains: term } },
          ]
        : undefined,
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.auditLogs.findMany({
        where,
        orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
        skip: (filter.page - 1) * auditPageSize,
        take: auditPageSize,
      }),
      this.prisma.auditLogs.count({ where }),
    ]);
    return {
      data: rows.map(({ id, ...row }) => ({ ...row, id: id.toString() })),
      meta: {
        page: filter.page,
        total,
        total_pages: Math.ceil(total / auditPageSize),
      },
      scope: canReadAll ? 'all' : 'self',
    };
  }
}
