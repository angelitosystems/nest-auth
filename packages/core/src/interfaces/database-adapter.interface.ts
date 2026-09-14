import {
  IUserRepository,
  IRoleRepository,
  IPermissionRepository,
  ISessionRepository,
  IRefreshTokenRepository,
  IPasswordResetRepository,
  IEmailVerificationRepository,
  IAuditLogRepository,
} from './repositories.interface';

export interface AuthDatabaseAdapter {
  readonly users: IUserRepository;
  readonly roles: IRoleRepository;
  readonly permissions: IPermissionRepository;
  readonly sessions: ISessionRepository;
  readonly refreshTokens: IRefreshTokenRepository;
  readonly passwordResets: IPasswordResetRepository;
  readonly emailVerifications: IEmailVerificationRepository;
  readonly auditLogs: IAuditLogRepository;

  init?(): Promise<void>;
  destroy?(): Promise<void>;
}
