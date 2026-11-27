import { SetMetadata } from '@nestjs/common';

export const REQUIRED_ROLES = Symbol('requiredRoles');
export const REQUIRED_PERMISSIONS = Symbol('requiredPermissions');

export const RequireRoles = (role: string, ...otherRoles: string[]) =>
  SetMetadata(REQUIRED_ROLES, [role, ...otherRoles]);

export const RequirePermissions = (
  permission: string,
  ...otherPermissions: string[]
) => SetMetadata(REQUIRED_PERMISSIONS, [permission, ...otherPermissions]);
