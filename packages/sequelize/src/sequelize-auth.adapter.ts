import {
  AuthDatabaseAdapter,
  IUserRepository,
  IRoleRepository,
  IPermissionRepository,
  ISessionRepository,
  IRefreshTokenRepository,
  IPasswordResetRepository,
  IEmailVerificationRepository,
  IAuditLogRepository,
  User,
  Role,
  Permission,
  Session,
  RefreshToken,
  PasswordReset,
  EmailVerification,
  AuditLog,
  CreateUserInput,
  UpdateUserInput,
  CreateSessionInput,
  CreateRefreshTokenInput,
  CreatePasswordResetInput,
  CreateEmailVerificationInput,
  CreateAuditLogInput,
} from '@angelitosystems/nest-auth';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import {
  UserModel,
  RoleModel,
  PermissionModel,
  SessionModel,
  RefreshTokenModel,
  PasswordResetModel,
  EmailVerificationModel,
  AuditLogModel,
  UserRoleModel,
  RolePermissionModel,
} from './models/auth.models';

export class SequelizeAuthAdapter implements AuthDatabaseAdapter {
  readonly users: IUserRepository;
  readonly roles: IRoleRepository;
  readonly permissions: IPermissionRepository;
  readonly sessions: ISessionRepository;
  readonly refreshTokens: IRefreshTokenRepository;
  readonly passwordResets: IPasswordResetRepository;
  readonly emailVerifications: IEmailVerificationRepository;
  readonly auditLogs: IAuditLogRepository;

  constructor(private readonly sequelize: Sequelize) {
    this.users = new SequelizeUserRepository();
    this.roles = new SequelizeRoleRepository();
    this.permissions = new SequelizePermissionRepository();
    this.sessions = new SequelizeSessionRepository();
    this.refreshTokens = new SequelizeRefreshTokenRepository();
    this.passwordResets = new SequelizePasswordResetRepository();
    this.emailVerifications = new SequelizeEmailVerificationRepository();
    this.auditLogs = new SequelizeAuditLogRepository();
  }

  async init(): Promise<void> {
    await this.sequelize.authenticate();
  }

  async destroy(): Promise<void> {
    await this.sequelize.close();
  }
}

class SequelizeUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const user = await UserModel.findByPk(id);
    return user ? (user.toJSON() as User) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ where: { email } });
    return user ? (user.toJSON() as User) : null;
  }

  async create(data: CreateUserInput): Promise<User> {
    const user = await UserModel.create({
      email: data.email,
      password_hash: data.password_hash,
      first_name: data.first_name,
      last_name: data.last_name,
      is_active: data.is_active ?? true,
      is_email_verified: data.is_email_verified ?? false,
      metadata: data.metadata ?? {},
    } as any);
    return user.toJSON() as User;
  }

  async update(id: string, data: UpdateUserInput): Promise<User> {
    await UserModel.update(data as any, { where: { id } });
    const updated = await this.findById(id);
    return updated!;
  }

  async softDelete(id: string): Promise<void> {
    await UserModel.destroy({ where: { id } });
    await UserModel.update({ is_active: false } as any, { where: { id }, paranoid: false });
  }

  async getUserRoles(userId: string): Promise<Role[]> {
    const user = await UserModel.findByPk(userId, {
      include: [RoleModel],
    });
    return (user?.roles || []).map((r) => r.toJSON() as Role);
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    const user = await UserModel.findByPk(userId, {
      include: [
        {
          model: RoleModel,
          include: [PermissionModel],
        },
      ],
    });
    const permissionMap = new Map<string, Permission>();
    if (user?.roles) {
      for (const role of user.roles) {
        if (role.permissions) {
          for (const perm of role.permissions) {
            permissionMap.set(perm.id, perm.toJSON() as Permission);
          }
        }
      }
    }
    return Array.from(permissionMap.values());
  }

  async assignRole(userId: string, roleName: string): Promise<void> {
    const role = await RoleModel.findOne({ where: { name: roleName } });
    if (!role) return;

    await UserRoleModel.findOrCreate({
      where: { user_id: userId, role_id: role.id },
      defaults: { user_id: userId, role_id: role.id } as any,
    });
  }

  async removeRole(userId: string, roleName: string): Promise<void> {
    const role = await RoleModel.findOne({ where: { name: roleName } });
    if (!role) return;

    await UserRoleModel.destroy({
      where: { user_id: userId, role_id: role.id },
    });
  }
}

class SequelizeRoleRepository implements IRoleRepository {
  async findById(id: string): Promise<Role | null> {
    const role = await RoleModel.findByPk(id);
    return role ? (role.toJSON() as Role) : null;
  }

  async findByName(name: string): Promise<Role | null> {
    const role = await RoleModel.findOne({ where: { name } });
    return role ? (role.toJSON() as Role) : null;
  }

  async findAll(): Promise<Role[]> {
    const roles = await RoleModel.findAll({ order: [['name', 'ASC']] });
    return roles.map((r) => r.toJSON() as Role);
  }

  async create(name: string, description?: string, isDefault = false): Promise<Role> {
    const role = await RoleModel.create({
      name,
      description,
      is_default: isDefault,
    } as any);
    return role.toJSON() as Role;
  }

  async getRolePermissions(roleId: string): Promise<Permission[]> {
    const role = await RoleModel.findByPk(roleId, {
      include: [PermissionModel],
    });
    return (role?.permissions || []).map((p) => p.toJSON() as Permission);
  }

  async grantPermission(roleId: string, permissionName: string): Promise<void> {
    const perm = await PermissionModel.findOne({ where: { name: permissionName } });
    if (!perm) return;

    await RolePermissionModel.findOrCreate({
      where: { role_id: roleId, permission_id: perm.id },
      defaults: { role_id: roleId, permission_id: perm.id } as any,
    });
  }

  async revokePermission(roleId: string, permissionName: string): Promise<void> {
    const perm = await PermissionModel.findOne({ where: { name: permissionName } });
    if (!perm) return;

    await RolePermissionModel.destroy({
      where: { role_id: roleId, permission_id: perm.id },
    });
  }
}

class SequelizePermissionRepository implements IPermissionRepository {
  async findById(id: string): Promise<Permission | null> {
    const perm = await PermissionModel.findByPk(id);
    return perm ? (perm.toJSON() as Permission) : null;
  }

  async findByName(name: string): Promise<Permission | null> {
    const perm = await PermissionModel.findOne({ where: { name } });
    return perm ? (perm.toJSON() as Permission) : null;
  }

  async findAll(): Promise<Permission[]> {
    const perms = await PermissionModel.findAll({ order: [['name', 'ASC']] });
    return perms.map((p) => p.toJSON() as Permission);
  }

  async create(name: string, description?: string): Promise<Permission> {
    const perm = await PermissionModel.create({ name, description } as any);
    return perm.toJSON() as Permission;
  }
}

class SequelizeSessionRepository implements ISessionRepository {
  async create(data: CreateSessionInput): Promise<Session> {
    const session = await SessionModel.create(data as any);
    return session.toJSON() as Session;
  }

  async findById(id: string): Promise<Session | null> {
    const session = await SessionModel.findByPk(id);
    return session ? (session.toJSON() as Session) : null;
  }

  async findByTokenHash(tokenHash: string): Promise<Session | null> {
    const session = await SessionModel.findOne({ where: { token_hash: tokenHash } });
    return session ? (session.toJSON() as Session) : null;
  }

  async findActiveByUserId(userId: string): Promise<Session[]> {
    const sessions = await SessionModel.findAll({
      where: {
        user_id: userId,
        is_revoked: false,
        expires_at: { [Op.gt]: new Date() },
      },
      order: [['last_activity', 'DESC']],
    });
    return sessions.map((s) => s.toJSON() as Session);
  }

  async updateActivity(id: string, ipAddress?: string): Promise<void> {
    const updateData: any = { last_activity: new Date() };
    if (ipAddress) updateData.ip_address = ipAddress;
    await SessionModel.update(updateData, { where: { id } });
  }

  async revoke(id: string): Promise<void> {
    await SessionModel.update({ is_revoked: true } as any, { where: { id } });
  }

  async revokeAllForUser(userId: string, exceptSessionId?: string): Promise<void> {
    const where: any = { user_id: userId };
    if (exceptSessionId) {
      where.id = { [Op.ne]: exceptSessionId };
    }
    await SessionModel.update({ is_revoked: true } as any, { where });
  }
}

class SequelizeRefreshTokenRepository implements IRefreshTokenRepository {
  async create(data: CreateRefreshTokenInput): Promise<RefreshToken> {
    const token = await RefreshTokenModel.create(data as any);
    return token.toJSON() as RefreshToken;
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    const token = await RefreshTokenModel.findOne({ where: { token_hash: tokenHash } });
    return token ? (token.toJSON() as RefreshToken) : null;
  }

  async revoke(id: string, replacedByTokenHash?: string): Promise<void> {
    await RefreshTokenModel.update(
      { is_revoked: true, replaced_by_token_hash: replacedByTokenHash } as any,
      { where: { id } },
    );
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await RefreshTokenModel.update({ is_revoked: true } as any, { where: { user_id: userId } });
  }
}

class SequelizePasswordResetRepository implements IPasswordResetRepository {
  async create(data: CreatePasswordResetInput): Promise<PasswordReset> {
    const pr = await PasswordResetModel.create(data as any);
    return pr.toJSON() as PasswordReset;
  }

  async findValidByTokenHash(tokenHash: string): Promise<PasswordReset | null> {
    const pr = await PasswordResetModel.findOne({
      where: {
        token_hash: tokenHash,
        is_used: false,
        expires_at: { [Op.gt]: new Date() },
      },
    });
    return pr ? (pr.toJSON() as PasswordReset) : null;
  }

  async markAsUsed(id: string): Promise<void> {
    await PasswordResetModel.update({ is_used: true } as any, { where: { id } });
  }

  async invalidateExistingForUser(userId: string): Promise<void> {
    await PasswordResetModel.update({ is_used: true } as any, { where: { user_id: userId, is_used: false } });
  }
}

class SequelizeEmailVerificationRepository implements IEmailVerificationRepository {
  async create(data: CreateEmailVerificationInput): Promise<EmailVerification> {
    const ev = await EmailVerificationModel.create(data as any);
    return ev.toJSON() as EmailVerification;
  }

  async findValidByTokenHash(tokenHash: string): Promise<EmailVerification | null> {
    const ev = await EmailVerificationModel.findOne({
      where: {
        token_hash: tokenHash,
        is_used: false,
        expires_at: { [Op.gt]: new Date() },
      },
    });
    return ev ? (ev.toJSON() as EmailVerification) : null;
  }

  async markAsUsed(id: string): Promise<void> {
    await EmailVerificationModel.update({ is_used: true } as any, { where: { id } });
  }

  async invalidateExistingForUser(userId: string): Promise<void> {
    await EmailVerificationModel.update({ is_used: true } as any, { where: { user_id: userId, is_used: false } });
  }
}

class SequelizeAuditLogRepository implements IAuditLogRepository {
  async create(data: CreateAuditLogInput): Promise<AuditLog> {
    const log = await AuditLogModel.create(data as any);
    return log.toJSON() as AuditLog;
  }

  async findByUserId(userId: string, limit = 50, offset = 0): Promise<AuditLog[]> {
    const logs = await AuditLogModel.findAll({
      where: { user_id: userId },
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });
    return logs.map((l) => l.toJSON() as AuditLog);
  }

  async findAll(limit = 100, offset = 0): Promise<AuditLog[]> {
    const logs = await AuditLogModel.findAll({
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });
    return logs.map((l) => l.toJSON() as AuditLog);
  }
}
