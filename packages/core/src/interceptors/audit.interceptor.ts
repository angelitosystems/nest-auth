import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AUDITED_KEY, AUTH_DATABASE_ADAPTER, AUTH_MODULE_OPTIONS } from '../constants/auth.constants';
import { AuthDatabaseAdapter } from '../interfaces/database-adapter.interface';
import { AuthModuleOptions } from '../interfaces/auth-module-options.interface';
import { AuditedOptions } from '../decorators/audited.decorator';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    @Inject(AUTH_DATABASE_ADAPTER)
    private readonly adapter: AuthDatabaseAdapter,
    @Inject(AUTH_MODULE_OPTIONS)
    private readonly options: AuthModuleOptions,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditOptions = this.reflector.getAllAndOverride<AuditedOptions>(
      AUDITED_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If auditLogs feature is disabled or route not audited, skip
    const isAuditEnabled = this.options.features?.auditLogs !== false;
    if (!isAuditEnabled || !auditOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const route = request.route?.path || request.url;
    const ip = request.ip || request.headers?.['x-forwarded-for'];
    const userAgent = request.headers?.['user-agent'];
    const userId = request.user?.id || null;

    const action = auditOptions.action || `${method}_${route}`;
    const entity = auditOptions.entity || 'REQUEST';
    const entityId = request.params?.id || request.body?.id || null;
    const oldValues = request.__oldValues || null;

    return next.handle().pipe(
      tap({
        next: async (data) => {
          try {
            await this.adapter.auditLogs.create({
              user_id: userId,
              action,
              entity,
              entity_id: entityId,
              method,
              route,
              ip,
              user_agent: userAgent,
              old_values: oldValues,
              new_values: data && typeof data === 'object' ? data : null,
              metadata: {
                query: request.query,
                params: request.params,
              },
            });
          } catch {
            // Never fail the primary response due to an audit write failure
          }
        },
      }),
    );
  }
}
