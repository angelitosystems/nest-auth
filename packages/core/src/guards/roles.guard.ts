import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  AUTH_MODULE_OPTIONS,
  ROLES_KEY,
  ROLES_MODE_KEY,
} from '../constants/auth.constants';
import { AuthModuleOptions } from '../interfaces/auth-module-options.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(AUTH_MODULE_OPTIONS)
    private readonly options: AuthModuleOptions,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.roles || !Array.isArray(user.roles)) {
      throw new ForbiddenException('Access denied: insufficient role privileges');
    }

    const mode =
      this.reflector.getAllAndOverride<'OR' | 'AND'>(ROLES_MODE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ||
      this.options.security?.rolesMode ||
      'OR';

    const userRoles: string[] = user.roles;

    let hasPermission = false;
    if (mode === 'AND') {
      hasPermission = requiredRoles.every((role) => userRoles.includes(role));
    } else {
      hasPermission = requiredRoles.some((role) => userRoles.includes(role));
    }

    if (!hasPermission) {
      throw new ForbiddenException(
        `Access denied: requires ${mode === 'AND' ? 'all' : 'one'} of roles [${requiredRoles.join(', ')}]`,
      );
    }

    return true;
  }
}
