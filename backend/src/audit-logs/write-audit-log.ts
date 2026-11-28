import { UnauthorizedException } from '@nestjs/common';
import { AuditAction, Prisma } from '@prisma/client';

export async function writeAuditLog(
  tx: Prisma.TransactionClient,
  change: {
    actorId: number;
    entityType: 'items' | 'users' | 'departments';
    entityId: number | string;
    entityName?: string | null;
    action: AuditAction;
    oldValues?: Prisma.InputJsonObject;
    newValues?: Prisma.InputJsonObject;
    reason?: string;
  },
) {
  const actor = await tx.users.findUnique({
    where: { id: change.actorId },
    select: { username: true, name: true },
  });
  if (!actor) throw new UnauthorizedException();

  await tx.auditLogs.create({
    data: {
      actor_id: change.actorId,
      actor_name: actor.name || actor.username,
      entity_type: change.entityType,
      entity_id: String(change.entityId),
      entity_name: change.entityName
        ? Array.from(change.entityName).slice(0, 255).join('')
        : null,
      action: change.action,
      old_values: change.oldValues ?? Prisma.DbNull,
      new_values: change.newValues ?? Prisma.DbNull,
      reason: change.reason,
    },
  });
}
