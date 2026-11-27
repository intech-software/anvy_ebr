import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { AuthService } from '../auth/auth.service';
import {
  REQUIRED_PERMISSIONS,
  REQUIRED_ROLES,
} from './access-control.decorator';
import { AccessControlService } from './access-control.service';

@Injectable()
export class AccessControlGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly auth: AuthService,
    private readonly accessControl: AccessControlService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()];
    const requiredRoles = this.reflector.getAllAndMerge<string[]>(
      REQUIRED_ROLES,
      targets,
    );
    const requiredPermissions = this.reflector.getAllAndMerge<string[]>(
      REQUIRED_PERMISSIONS,
      targets,
    );
    if (!requiredRoles.length && !requiredPermissions.length) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const userId = await this.auth.getSessionUserId(
      request.headers.authorization,
    );
    const access = await this.accessControl.getUserAccess(userId);
    if (!access) throw new UnauthorizedException();

    return (
      requiredRoles.every((role) => access.roles.has(role)) &&
      requiredPermissions.every((permission) =>
        access.permissions.has(permission),
      )
    );
  }
}
