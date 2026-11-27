import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AccessControlService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserAccess(id: number) {
    const user = await this.prisma.users.findUnique({
      where: { id },
      select: {
        userRoles: {
          select: {
            role: {
              select: {
                name: true,
                rolePermissions: {
                  select: { permission: { select: { name: true } } },
                },
              },
            },
          },
        },
      },
    });
    if (!user) return null;

    const roles = user.userRoles.map(({ role }) => role);
    return {
      roles: new Set(roles.map(({ name }) => name)),
      permissions: new Set(
        roles.flatMap(({ rolePermissions }) =>
          rolePermissions.map(({ permission }) => permission.name),
        ),
      ),
    };
  }
}
