import { Inject, Injectable } from '@nestjs/common';
import { AUTH_DATABASE_ADAPTER, AUTH_MODULE_OPTIONS } from '../constants/auth.constants';
import { AuthDatabaseAdapter } from '../interfaces/database-adapter.interface';
import { AuthModuleOptions } from '../interfaces/auth-module-options.interface';
import { AuditLog } from '../interfaces/models.interface';
import { CreateAuditLogInput } from '../interfaces/repositories.interface';

@Injectable()
export class AuditService {
  constructor(
    @Inject(AUTH_DATABASE_ADAPTER)
    private readonly adapter: AuthDatabaseAdapter,
    @Inject(AUTH_MODULE_OPTIONS)
    private readonly options: AuthModuleOptions,
  ) {}

  async log(entry: CreateAuditLogInput): Promise<AuditLog | null> {
    if (this.options.features?.auditLogs === false) {
      return null;
    }
    return this.adapter.auditLogs.create(entry);
  }

  async getUserLogs(userId: string, limit = 50, offset = 0): Promise<AuditLog[]> {
    return this.adapter.auditLogs.findByUserId(userId, limit, offset);
  }

  async getAllLogs(limit = 100, offset = 0): Promise<AuditLog[]> {
    return this.adapter.auditLogs.findAll(limit, offset);
  }
}
