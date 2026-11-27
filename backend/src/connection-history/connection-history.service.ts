import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { AccessControlService } from '../access-control/access-control.service';
import { PrismaService } from '../prisma.service';

const idleAfter = 60_000;
const staleAfter = 120_000;
const reconnectGrace = 90_000;
const pageSize = 50;
export const connectionStatuses = [
  'connected',
  'reconnecting',
  'ended',
] as const;
type ConnectionStatus = (typeof connectionStatuses)[number];

type Identity = { userId: number; loginKey: string };
type Presence = {
  event: 'connect' | 'beat' | 'disconnect';
  tab: string;
  connection: string;
};

@Injectable()
export class ConnectionHistoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessControl: AccessControlService,
  ) {}

  private async lockLogin(
    tx: Prisma.TransactionClient,
    { loginKey, userId }: Identity,
  ) {
    await tx.connectionLogins.createMany({
      data: [{ login_key: loginKey, user_id: userId }],
      skipDuplicates: true,
    });
    return tx.connectionLogins.update({
      where: { login_key: loginKey },
      data: { user_id: userId },
      select: { ended_at: true },
    });
  }

  async record(
    identity: Identity,
    event: Presence,
    ip?: string,
    agent?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const login = await this.lockLogin(tx, identity);
      if (login.ended_at) throw new UnauthorizedException();

      const now = new Date();
      const activeKey = `${identity.loginKey}:${event.tab}`;
      const active = await tx.userAppSessions.findUnique({
        where: { active_key: activeKey },
      });
      if (event.event === 'disconnect') {
        await tx.userAppSessions.updateMany({
          where: {
            active_key: activeKey,
            connection_key: event.connection,
            disconnected_at: null,
          },
          data: { disconnected_at: now },
        });
        return true;
      }

      if (active) {
        const expired = this.hasExpired(active, now);
        if (expired) {
          await tx.userAppSessions.updateMany({
            where: { id: active.id, active_key: activeKey },
            data: {
              active_key: null,
              ended_at: active.disconnected_at ?? active.last_seen_at,
            },
          });
        } else if (
          event.event === 'connect' ||
          active.connection_key === event.connection
        ) {
          const reconnect =
            active.connection_key !== event.connection ||
            active.disconnected_at !== null ||
            now.getTime() - active.last_seen_at.getTime() >= idleAfter;
          const saved = await tx.userAppSessions.updateMany({
            where: { id: active.id, active_key: activeKey },
            data: {
              last_seen_at: now,
              disconnected_at: null,
              connection_key: event.connection,
              connection_count: reconnect ? { increment: 1 } : undefined,
            },
          });
          if (saved.count) return true;
        }
      }
      if (event.event === 'beat') return false;

      await tx.userAppSessions.create({
        data: {
          login_key: identity.loginKey,
          client_session_id: event.tab,
          active_key: activeKey,
          connection_key: event.connection,
          connected_at: now,
          last_seen_at: now,
          ip_address: ip?.slice(0, 45),
          user_agent: agent?.slice(0, 1000),
        },
      });
      return true;
    });
  }

  async endLogin(identity: Identity) {
    await this.prisma.$transaction(async (tx) => {
      const login = await this.lockLogin(tx, identity);
      if (login.ended_at) return;
      const now = new Date();
      await tx.connectionLogins.update({
        where: { login_key: identity.loginKey },
        data: { ended_at: now },
      });
      await tx.userAppSessions.updateMany({
        where: { login_key: identity.loginKey, ended_at: null },
        data: { ended_at: now, active_key: null },
      });
    });
  }

  @Interval(30_000)
  async expireInactive() {
    const now = Date.now();
    const stale = await this.prisma.userAppSessions.findMany({
      where: {
        active_key: { not: null },
        OR: [
          { disconnected_at: { lte: new Date(now - reconnectGrace) } },
          {
            disconnected_at: null,
            last_seen_at: { lte: new Date(now - staleAfter) },
          },
        ],
      },
      take: 500,
      orderBy: { last_seen_at: 'asc' },
      select: {
        id: true,
        last_seen_at: true,
        disconnected_at: true,
        connection_key: true,
      },
    });
    await this.prisma.$transaction(
      stale.map((row) =>
        this.prisma.userAppSessions.updateMany({
          where: { ...row, active_key: { not: null } },
          data: {
            active_key: null,
            ended_at: row.disconnected_at ?? row.last_seen_at,
          },
        }),
      ),
    );
  }

  async list(
    userId: number,
    filter: {
      page: number;
      q?: string;
      status?: ConnectionStatus;
      from?: string;
      to?: string;
    },
  ) {
    const access = await this.accessControl.getUserAccess(userId);
    if (!access) throw new UnauthorizedException();
    const canReadAll = access.permissions.has('users.list');
    const q = filter.q?.replace(/[\\%_]/g, '\\$&');
    const dates = (date: string) =>
      new Date(`${date}T00:00:00+07:00`).getTime();
    const criteria: Prisma.UserAppSessionsWhereInput = {
      login: canReadAll ? undefined : { user_id: userId },
      connected_at: {
        gte: filter.from ? new Date(dates(filter.from)) : undefined,
        lt: filter.to ? new Date(dates(filter.to) + 86400_000) : undefined,
      },
      OR: q
        ? [
            { ip_address: { contains: q } },
            { login: { user: { username: { contains: q } } } },
            { login: { user: { name: { contains: q } } } },
          ]
        : undefined,
    };
    const now = new Date();
    const cutoff = new Date(now.getTime() - idleAfter);
    const statuses: Record<ConnectionStatus, Prisma.UserAppSessionsWhereInput> =
      {
        connected: {
          ended_at: null,
          disconnected_at: null,
          last_seen_at: { gt: cutoff },
        },
        reconnecting: {
          ended_at: null,
          OR: [
            { disconnected_at: { not: null } },
            { last_seen_at: { lte: cutoff } },
          ],
        },
        ended: { ended_at: { not: null } },
      };
    const [rows, connected, reconnecting, ended] = await Promise.all([
      this.prisma.userAppSessions.findMany({
        where: {
          AND: [criteria, filter.status ? statuses[filter.status] : {}],
        },
        orderBy: [{ connected_at: 'desc' }, { id: 'desc' }],
        skip: (filter.page - 1) * pageSize,
        take: pageSize + 1,
        select: {
          id: true,
          connected_at: true,
          last_seen_at: true,
          disconnected_at: true,
          ended_at: true,
          connection_count: true,
          ip_address: true,
          user_agent: true,
          login: {
            select: { user: { select: { username: true, name: true } } },
          },
        },
      }),
      ...connectionStatuses.map((status) =>
        this.prisma.userAppSessions.count({
          where: { AND: [criteria, statuses[status]] },
        }),
      ),
    ]);
    return {
      data: rows.slice(0, pageSize).map(({ login, ...row }) => ({
        ...row,
        user: login.user,
        status: row.ended_at
          ? 'ended'
          : row.disconnected_at || row.last_seen_at <= cutoff
            ? 'reconnecting'
            : 'connected',
      })),
      hasMore: rows.length > pageSize,
      summary: { connected, reconnecting, ended },
      asOf: now,
      scope: canReadAll ? 'all' : 'self',
    };
  }

  private hasExpired(
    record: { disconnected_at: Date | null; last_seen_at: Date },
    now: Date,
  ) {
    return record.disconnected_at
      ? now.getTime() - record.disconnected_at.getTime() >= reconnectGrace
      : now.getTime() - record.last_seen_at.getTime() >= staleAfter;
  }
}
