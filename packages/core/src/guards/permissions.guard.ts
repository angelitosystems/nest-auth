import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../constants/auth.constants';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.permissions || !Array.isArray(user.permissions)) {
      throw new ForbiddenException('Access denied: insufficient permissions');
    }

    const userPermissions: string[] = user.permissions;

    // Check if every required permission is satisfied by at least one user permission or wildcard
    const hasAll = requiredPermissions.every((required) =>
      this.matchPermission(required, userPermissions),
    );

    if (!hasAll) {
      throw new ForbiddenException(
        `Access denied: missing required permissions [${requiredPermissions.join(', ')}]`,
      );
    }

    return true;
  }

  /**
   * Matches a required permission against list of user permissions.
   * Supports global wildcard '*', prefix wildcard 'users.*', and exact match.
   */
  public matchPermission(required: string, userPermissions: string[]): boolean {
    return userPermissions.some((userPerm) => {
      // 1. Superuser wildcard '*'
      if (userPerm === '*') return true;

      // 2. Exact match
      if (userPerm === required) return true;

      // 3. Dot or colon wildcard, e.g. "users.*" matches "users.read", "users.create.all"
      if (userPerm.endsWith('.*')) {
        const prefix = userPerm.slice(0, -2);
        return required === prefix || required.startsWith(`${prefix}.`);
      }

      if (userPerm.endsWith(':*')) {
        const prefix = userPerm.slice(0, -2);
        return required === prefix || required.startsWith(`${prefix}:`);
      }

      return false;
    });
  }
}
