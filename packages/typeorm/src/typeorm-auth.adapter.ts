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
import { DataSource, In, Not } from 'typeorm';
import {
  UserEntity,
  RoleEntity,
  PermissionEntity,
  SessionEntity,
  RefreshTokenEntity,
  PasswordResetEntity,
  EmailVerificationEntity,
  AuditLogEntity,
} from './entities/auth.entities';

export class TypeOrmAuthAdapter implements AuthDatabaseAdapter {
  readonly users: IUserRepository;
  readonly roles: IRoleRepository;
  readonly permissions: IPermissionRepository;
  readonly sessions: ISessionRepository;
  readonly refreshTokens: IRefreshTokenRepository;
  readonly passwordResets: IPasswordResetRepository;
  readonly emailVerifications: IEmailVerificationRepository;
  readonly auditLogs: IAuditLogRepository;

  constructor(private readonly dataSource: DataSource) {
    this.users = new TypeOrmUserRepository(this.dataSource);
    this.roles = new TypeOrmRoleRepository(this.dataSource);
    this.permissions = new TypeOrmPermissionRepository(this.dataSource);
    this.sessions = new TypeOrmSessionRepository(this.dataSource);
    this.refreshTokens = new TypeOrmRefreshTokenRepository(this.dataSource);
    this.passwordResets = new TypeOrmPasswordResetRepository(this.dataSource);
    this.emailVerifications = new TypeOrmEmailVerificationRepository(this.dataSource);
    this.auditLogs = new TypeOrmAuditLogRepository(this.dataSource);
  }

  async init(): Promise<void> {
    if (!this.dataSource.isInitialized) {
      await this.dataSource.initialize();
    }
  }

  async destroy(): Promise<void> {
    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();
    }
  }
}

class TypeOrmUserRepository implements IUserRepository {
  constructor(private readonly dataSource: DataSource) {}

  private get repo() {
    return this.dataSource.getRepository(UserEntity);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.repo.findOne({ where: { id } });
    return user ? (user as any as User) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.repo.findOne({ where: { email } });
    return user ? (user as any as User) : null;
  }

  async create(data: CreateUserInput): Promise<User> {
    const entity = this.repo.create({
      email: data.email,
      password_hash: data.password_hash,
      first_name: data.first_name,
      last_name: data.last_name,
      is_active: data.is_active ?? true,
      is_email_verified: data.is_email_verified ?? false,
      metadata: data.metadata ?? {},
    });
    const saved = await this.repo.save(entity);
    return saved as any as User;
  }

  async update(id: string, data: UpdateUserInput): Promise<User> {
    await this.repo.update(id, data as any);
    const updated = await this.findById(id);
    return updated!;
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
    await this.repo.update(id, { is_active: false });
  }

  async getUserRoles(userId: string): Promise<Role[]> {
    const user = await this.repo.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    return (user?.roles || []) as any as Role[];
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    const user = await this.repo.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });
    const permissionMap = new Map<string, Permission>();
    if (user?.roles) {
      for (const role of user.roles) {
        if (role.permissions) {
          for (const perm of role.permissions) {
            permissionMap.set(perm.id, perm as any as Permission);
          }
        }
      }
    }
    return Array.from(permissionMap.values());
  }

  async assignRole(userId: string, roleName: string): Promise<void> {
    const roleRepo = this.dataSource.getRepository(RoleEntity);
    const role = await roleRepo.findOne({ where: { name: roleName } });
    const user = await this.repo.findOne({ where: { id: userId }, relations: ['roles'] });
    if (!role || !user) return;

    if (!user.roles.some((r) => r.id === role.id)) {
      user.roles.push(role);
      await this.repo.save(user);
    }
  }

  async removeRole(userId: string, roleName: string): Promise<void> {
    const user = await this.repo.findOne({ where: { id: userId }, relations: ['roles'] });
    if (!user) return;

    user.roles = user.roles.filter((r) => r.name !== roleName);
    await this.repo.save(user);
  }
}

class TypeOrmRoleRepository implements IRoleRepository {
  constructor(private readonly dataSource: DataSource) {}

  private get repo() {
    return this.dataSource.getRepository(RoleEntity);
  }

  async findById(id: string): Promise<Role | null> {
    const role = await this.repo.findOne({ where: { id } });
    return role ? (role as any as Role) : null;
  }

  async findByName(name: string): Promise<Role | null> {
    const role = await this.repo.findOne({ where: { name } });
    return role ? (role as any as Role) : null;
  }

  async findAll(): Promise<Role[]> {
    const roles = await this.repo.find({ order: { name: 'ASC' } });
    return roles as any as Role[];
  }

  async create(name: string, description?: string, isDefault = false): Promise<Role> {
    const entity = this.repo.create({ name, description, is_default: isDefault });
    const saved = await this.repo.save(entity);
    return saved as any as Role;
  }

  async getRolePermissions(roleId: string): Promise<Permission[]> {
    const role = await this.repo.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });
    return (role?.permissions || []) as any as Permission[];
  }

  async grantPermission(roleId: string, permissionName: string): Promise<void> {
    const permRepo = this.dataSource.getRepository(PermissionEntity);
    const perm = await permRepo.findOne({ where: { name: permissionName } });
    const role = await this.repo.findOne({ where: { id: roleId }, relations: ['permissions'] });
    if (!perm || !role) return;

    if (!role.permissions.some((p) => p.id === perm.id)) {
      role.permissions.push(perm);
      await this.repo.save(role);
    }
  }

  async revokePermission(roleId: string, permissionName: string): Promise<void> {
    const role = await this.repo.findOne({ where: { id: roleId }, relations: ['permissions'] });
    if (!role) return;

    role.permissions = role.permissions.filter((p) => p.name !== permissionName);
    await this.repo.save(role);
  }
}

class TypeOrmPermissionRepository implements IPermissionRepository {
  constructor(private readonly dataSource: DataSource) {}

  private get repo() {
    return this.dataSource.getRepository(PermissionEntity);
  }

  async findById(id: string): Promise<Permission | null> {
    const perm = await this.repo.findOne({ where: { id } });
    return perm ? (perm as any as Permission) : null;
  }

  async findByName(name: string): Promise<Permission | null> {
    const perm = await this.repo.findOne({ where: { name } });
    return perm ? (perm as any as Permission) : null;
  }

  async findAll(): Promise<Permission[]> {
    const perms = await this.repo.find({ order: { name: 'ASC' } });
    return perms as any as Permission[];
  }

  async create(name: string, description?: string): Promise<Permission> {
    const entity = this.repo.create({ name, description });
    const saved = await this.repo.save(entity);
    return saved as any as Permission;
  }
}

class TypeOrmSessionRepository implements ISessionRepository {
  constructor(private readonly dataSource: DataSource) {}

  private get repo() {
    return this.dataSource.getRepository(SessionEntity);
  }

  async create(data: CreateSessionInput): Promise<Session> {
    const entity = this.repo.create(data as any);
    const saved = await this.repo.save(entity);
    return saved as any as Session;
  }

  async findById(id: string): Promise<Session | null> {
    const session = await this.repo.findOne({ where: { id } });
    return session ? (session as any as Session) : null;
  }

  async findByTokenHash(tokenHash: string): Promise<Session | null> {
    const session = await this.repo.findOne({ where: { token_hash: tokenHash } });
    return session ? (session as any as Session) : null;
  }

  async findActiveByUserId(userId: string): Promise<Session[]> {
    const sessions = await this.repo
      .createQueryBuilder('s')
      .where('s.user_id = :userId', { userId })
      .andWhere('s.is_revoked = false')
      .andWhere('s.expires_at > :now', { now: new Date() })
      .orderBy('s.last_activity', 'DESC')
      .getMany();
    return sessions as any as Session[];
  }

  async updateActivity(id: string, ipAddress?: string): Promise<void> {
    const updateData: any = { last_activity: new Date() };
    if (ipAddress) updateData.ip_address = ipAddress;
    await this.repo.update(id, updateData);
  }

  async revoke(id: string): Promise<void> {
    await this.repo.update(id, { is_revoked: true });
  }

  async revokeAllForUser(userId: string, exceptSessionId?: string): Promise<void> {
    const qb = this.repo
      .createQueryBuilder()
      .update(SessionEntity)
      .set({ is_revoked: true })
      .where('user_id = :userId', { userId });

    if (exceptSessionId) {
      qb.andWhere('id != :exceptSessionId', { exceptSessionId });
    }

    await qb.execute();
  }
}

class TypeOrmRefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private readonly dataSource: DataSource) {}

  private get repo() {
    return this.dataSource.getRepository(RefreshTokenEntity);
  }

  async create(data: CreateRefreshTokenInput): Promise<RefreshToken> {
    const entity = this.repo.create(data as any);
    const saved = await this.repo.save(entity);
    return saved as any as RefreshToken;
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    const token = await this.repo.findOne({ where: { token_hash: tokenHash } });
    return token ? (token as any as RefreshToken) : null;
  }

  async revoke(id: string, replacedByTokenHash?: string): Promise<void> {
    await this.repo.update(id, {
      is_revoked: true,
      replaced_by_token_hash: replacedByTokenHash,
    });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.repo.update({ user_id: userId }, { is_revoked: true });
  }
}

class TypeOrmPasswordResetRepository implements IPasswordResetRepository {
  constructor(private readonly dataSource: DataSource) {}

  private get repo() {
    return this.dataSource.getRepository(PasswordResetEntity);
  }

  async create(data: CreatePasswordResetInput): Promise<PasswordReset> {
    const entity = this.repo.create(data as any);
    const saved = await this.repo.save(entity);
    return saved as any as PasswordReset;
  }

  async findValidByTokenHash(tokenHash: string): Promise<PasswordReset | null> {
    const record = await this.repo
      .createQueryBuilder('pr')
      .where('pr.token_hash = :tokenHash', { tokenHash })
      .andWhere('pr.is_used = false')
      .andWhere('pr.expires_at > :now', { now: new Date() })
      .getOne();
    return record ? (record as any as PasswordReset) : null;
  }

  async markAsUsed(id: string): Promise<void> {
    await this.repo.update(id, { is_used: true });
  }

  async invalidateExistingForUser(userId: string): Promise<void> {
    await this.repo.update({ user_id: userId, is_used: false }, { is_used: true });
  }
}

class TypeOrmEmailVerificationRepository implements IEmailVerificationRepository {
  constructor(private readonly dataSource: DataSource) {}

  private get repo() {
    return this.dataSource.getRepository(EmailVerificationEntity);
  }

  async create(data: CreateEmailVerificationInput): Promise<EmailVerification> {
    const entity = this.repo.create(data as any);
    const saved = await this.repo.save(entity);
    return saved as any as EmailVerification;
  }

  async findValidByTokenHash(tokenHash: string): Promise<EmailVerification | null> {
    const record = await this.repo
      .createQueryBuilder('ev')
      .where('ev.token_hash = :tokenHash', { tokenHash })
      .andWhere('ev.is_used = false')
      .andWhere('ev.expires_at > :now', { now: new Date() })
      .getOne();
    return record ? (record as any as EmailVerification) : null;
  }

  async markAsUsed(id: string): Promise<void> {
    await this.repo.update(id, { is_used: true });
  }

  async invalidateExistingForUser(userId: string): Promise<void> {
    await this.repo.update({ user_id: userId, is_used: false }, { is_used: true });
  }
}

class TypeOrmAuditLogRepository implements IAuditLogRepository {
  constructor(private readonly dataSource: DataSource) {}

  private get repo() {
    return this.dataSource.getRepository(AuditLogEntity);
  }

  async create(data: CreateAuditLogInput): Promise<AuditLog> {
    const entity = this.repo.create(data as any);
    const saved = await this.repo.save(entity);
    return saved as any as AuditLog;
  }

  async findByUserId(userId: string, limit = 50, offset = 0): Promise<AuditLog[]> {
    const logs = await this.repo.find({
      where: { user_id: userId },
      take: limit,
      skip: offset,
      order: { created_at: 'DESC' },
    });
    return logs as any as AuditLog[];
  }

  async findAll(limit = 100, offset = 0): Promise<AuditLog[]> {
    const logs = await this.repo.find({
      take: limit,
      skip: offset,
      order: { created_at: 'DESC' },
    });
    return logs as any as AuditLog[];
  }
}
