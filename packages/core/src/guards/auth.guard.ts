import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  AUTH_DATABASE_ADAPTER,
  AUTH_MODULE_OPTIONS,
  DEFAULT_COOKIE_NAME,
  IS_PUBLIC_KEY,
} from '../constants/auth.constants';
import { AuthDatabaseAdapter } from '../interfaces/database-adapter.interface';
import { AuthModuleOptions } from '../interfaces/auth-module-options.interface';
import { TokenService } from '../security/token.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenService: TokenService,
    @Inject(AUTH_MODULE_OPTIONS)
    private readonly options: AuthModuleOptions,
    @Inject(AUTH_DATABASE_ADAPTER)
    private readonly adapter: AuthDatabaseAdapter,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Authentication token not found');
    }

    try {
      const payload = this.tokenService.verify(token);

      const user = await this.adapter.users.findById(payload.sub);
      if (!user || !user.is_active || user.deleted_at) {
        throw new UnauthorizedException('User account is inactive or not found');
      }

      // Check session validity if sessions are enabled
      if (this.options.sessions?.enabled && payload.sessionId) {
        const session = await this.adapter.sessions.findById(payload.sessionId);
        if (!session || session.is_revoked || new Date(session.expires_at) < new Date()) {
          throw new UnauthorizedException('Session has been revoked or expired');
        }
        await this.adapter.sessions.updateActivity(session.id, request.ip);
        request.session = session;
      }

      // Populate roles & permissions if not in payload
      let roles = payload.roles;
      let permissions = payload.permissions;

      if (!roles) {
        const userRoles = await this.adapter.users.getUserRoles(user.id);
        roles = userRoles.map((r) => r.name);
      }

      if (!permissions) {
        const userPermissions = await this.adapter.users.getUserPermissions(user.id);
        permissions = userPermissions.map((p) => p.name);
      }

      request.user = {
        ...user,
        roles,
        permissions,
        sessionId: payload.sessionId,
      };

      return true;
    } catch (err: any) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException(err.message || 'Invalid or expired token');
    }
  }

  private extractToken(request: any): string | null {
    // 1. Check Bearer Authorization Header
    const authHeader = request.headers?.authorization;
    if (authHeader && typeof authHeader === 'string') {
      const [type, token] = authHeader.split(' ');
      if (type?.toLowerCase() === 'bearer' && token) {
        return token;
      }
    }

    // 2. Check Cookie if enabled
    if (this.options.cookies?.enabled) {
      const cookieName = this.options.cookies.name || DEFAULT_COOKIE_NAME;
      if (request.cookies && request.cookies[cookieName]) {
        return request.cookies[cookieName];
      }
    }

    return null;
  }
}
