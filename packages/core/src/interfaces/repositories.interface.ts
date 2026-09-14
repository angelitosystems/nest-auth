import {
  User,
  Role,
  Permission,
  Session,
  RefreshToken,
  PasswordReset,
  EmailVerification,
  AuditLog,
} from './models.interface';

export interface CreateUserInput {
  email: string;
  password_hash: string;
  first_name?: string | null;
  last_name?: string | null;
  is_active?: boolean;
  is_email_verified?: boolean;
  metadata?: Record<string, any> | null;
}

export interface UpdateUserInput {
  email?: string;
  password_hash?: string;
  first_name?: string | null;
  last_name?: string | null;
  is_active?: boolean;
  is_email_verified?: boolean;
  two_factor_enabled?: boolean;
  two_factor_secret?: string | null;
  two_factor_recovery_codes?: string[] | null;
  metadata?: Record<string, any> | null;
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserInput): Promise<User>;
  update(id: string, data: UpdateUserInput): Promise<User>;
  softDelete(id: string): Promise<void>;
  getUserRoles(userId: string): Promise<Role[]>;
  getUserPermissions(userId: string): Promise<Permission[]>;
  assignRole(userId: string, roleName: string): Promise<void>;
  removeRole(userId: string, roleName: string): Promise<void>;
}

export interface IRoleRepository {
  findById(id: string): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  findAll(): Promise<Role[]>;
  create(name: string, description?: string, isDefault?: boolean): Promise<Role>;
  getRolePermissions(roleId: string): Promise<Permission[]>;
  grantPermission(roleId: string, permissionName: string): Promise<void>;
  revokePermission(roleId: string, permissionName: string): Promise<void>;
}

export interface IPermissionRepository {
  findById(id: string): Promise<Permission | null>;
  findByName(name: string): Promise<Permission | null>;
  findAll(): Promise<Permission[]>;
  create(name: string, description?: string): Promise<Permission>;
}

export interface CreateSessionInput {
  user_id: string;
  token_hash: string;
  ip_address?: string | null;
  user_agent?: string | null;
  device?: string | null;
  expires_at: Date;
}

export interface ISessionRepository {
  create(data: CreateSessionInput): Promise<Session>;
  findById(id: string): Promise<Session | null>;
  findByTokenHash(tokenHash: string): Promise<Session | null>;
  findActiveByUserId(userId: string): Promise<Session[]>;
  updateActivity(id: string, ipAddress?: string): Promise<void>;
  revoke(id: string): Promise<void>;
  revokeAllForUser(userId: string, exceptSessionId?: string): Promise<void>;
}

export interface CreateRefreshTokenInput {
  user_id: string;
  session_id?: string | null;
  token_hash: string;
  expires_at: Date;
}

export interface IRefreshTokenRepository {
  create(data: CreateRefreshTokenInput): Promise<RefreshToken>;
  findByTokenHash(tokenHash: string): Promise<RefreshToken | null>;
  revoke(id: string, replacedByTokenHash?: string): Promise<void>;
  revokeAllForUser(userId: string): Promise<void>;
}

export interface CreatePasswordResetInput {
  user_id: string;
  token_hash: string;
  expires_at: Date;
}

export interface IPasswordResetRepository {
  create(data: CreatePasswordResetInput): Promise<PasswordReset>;
  findValidByTokenHash(tokenHash: string): Promise<PasswordReset | null>;
  markAsUsed(id: string): Promise<void>;
  invalidateExistingForUser(userId: string): Promise<void>;
}

export interface CreateEmailVerificationInput {
  user_id: string;
  token_hash: string;
  expires_at: Date;
}

export interface IEmailVerificationRepository {
  create(data: CreateEmailVerificationInput): Promise<EmailVerification>;
  findValidByTokenHash(tokenHash: string): Promise<EmailVerification | null>;
  markAsUsed(id: string): Promise<void>;
  invalidateExistingForUser(userId: string): Promise<void>;
}

export interface CreateAuditLogInput {
  user_id?: string | null;
  action: string;
  entity: string;
  entity_id?: string | null;
  method?: string | null;
  route?: string | null;
  ip?: string | null;
  user_agent?: string | null;
  old_values?: Record<string, any> | null;
  new_values?: Record<string, any> | null;
  metadata?: Record<string, any> | null;
}

export interface IAuditLogRepository {
  create(data: CreateAuditLogInput): Promise<AuditLog>;
  findByUserId(userId: string, limit?: number, offset?: number): Promise<AuditLog[]>;
  findAll(limit?: number, offset?: number): Promise<AuditLog[]>;
}
