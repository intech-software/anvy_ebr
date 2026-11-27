import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class ItemSessionGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    await this.auth.getSessionUser(request.headers.authorization);
    return true;
  }
}
