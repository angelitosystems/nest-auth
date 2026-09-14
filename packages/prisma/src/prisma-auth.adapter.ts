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

export class PrismaAuthAdapter implements AuthDatabaseAdapter {
  readonly users: IUserRepository;
  readonly roles: IRoleRepository;
  readonly permissions: IPermissionRepository;
  readonly sessions: ISessionRepository;
  readonly refreshTokens: IRefreshTokenRepository;
  readonly passwordResets: IPasswordResetRepository;
  readonly emailVerifications: IEmailVerificationRepository;
  readonly auditLogs: IAuditLogRepository;

  constructor(private readonly prisma: any) {
    this.users = new PrismaUserRepository(this.prisma);
    this.roles = new PrismaRoleRepository(this.prisma);
    this.permissions = new PrismaPermissionRepository(this.prisma);
    this.sessions = new PrismaSessionRepository(this.prisma);
    this.refreshTokens = new PrismaRefreshTokenRepository(this.prisma);
    this.passwordResets = new PrismaPasswordResetRepository(this.prisma);
    this.emailVerifications = new PrismaEmailVerificationRepository(this.prisma);
    this.auditLogs = new PrismaAuditLogRepository(this.prisma);
  }

  async init(): Promise<void> {
    if (this.prisma.$connect) {
      await this.prisma.$connect();
    }
  }

  async destroy(): Promise<void> {
    if (this.prisma.$disconnect) {
      await this.prisma.$disconnect();
    }
  }
}

class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: any) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { id, deleted_at: null },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { email, deleted_at: null },
    });
  }

  async create(data: CreateUserInput): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: data.email,
        password_hash: data.password_hash,
        first_name: data.first_name,
        last_name: data.last_name,
        is_active: data.is_active ?? true,
        is_email_verified: data.is_email_verified ?? false,
        metadata: data.metadata ?? {},
      },
    });
  }

  async update(id: string, data: UpdateUserInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { deleted_at: new Date(), is_active: false },
    });
  }

  async getUserRoles(userId: string): Promise<Role[]> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { user_id: userId },
      include: { role: true },
    });
    return userRoles.map((ur: any) => ur.role);
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { user_id: userId },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    const permissionMap = new Map<string, Permission>();
    for (const ur of userRoles) {
      for (const rp of ur.role.permissions) {
        permissionMap.set(rp.permission.id, rp.permission);
      }
    }
    return Array.from(permissionMap.values());
  }

  async assignRole(userId: string, roleName: string): Promise<void> {
    const role = await this.prisma.role.findUnique({ where: { name: roleName } });
    if (!role) return;

    await this.prisma.userRole.upsert({
      where: {
        user_id_role_id: { user_id: userId, role_id: role.id },
      },
      create: { user_id: userId, role_id: role.id },
      update: {},
    });
  }

  async removeRole(userId: string, roleName: string): Promise<void> {
    const role = await this.prisma.role.findUnique({ where: { name: roleName } });
    if (!role) return;

    await this.prisma.userRole.deleteMany({
      where: { user_id: userId, role_id: role.id },
    });
  }
}

class PrismaRoleRepository implements IRoleRepository {
  constructor(private readonly prisma: any) {}

  async findById(id: string): Promise<Role | null> {
    return this.prisma.role.findUnique({ where: { id } });
  }

  async findByName(name: string): Promise<Role | null> {
    return this.prisma.role.findUnique({ where: { name } });
  }

  async findAll(): Promise<Role[]> {
    return this.prisma.role.findMany({ orderBy: { name: 'asc' } });
  }

  async create(name: string, description?: string, isDefault = false): Promise<Role> {
    return this.prisma.role.create({
      data: { name, description, is_default: isDefault },
    });
  }

  async getRolePermissions(roleId: string): Promise<Permission[]> {
    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: { role_id: roleId },
      include: { permission: true },
    });
    return rolePermissions.map((rp: any) => rp.permission);
  }

  async grantPermission(roleId: string, permissionName: string): Promise<void> {
    const permission = await this.prisma.permission.findUnique({ where: { name: permissionName } });
    if (!permission) return;

    await this.prisma.rolePermission.upsert({
      where: {
        role_id_permission_id: { role_id: roleId, permission_id: permission.id },
      },
      create: { role_id: roleId, permission_id: permission.id },
      update: {},
    });
  }

  async revokePermission(roleId: string, permissionName: string): Promise<void> {
    const permission = await this.prisma.permission.findUnique({ where: { name: permissionName } });
    if (!permission) return;

    await this.prisma.rolePermission.deleteMany({
      where: { role_id: roleId, permission_id: permission.id },
    });
  }
}

class PrismaPermissionRepository implements IPermissionRepository {
  constructor(private readonly prisma: any) {}

  async findById(id: string): Promise<Permission | null> {
    return this.prisma.permission.findUnique({ where: { id } });
  }

  async findByName(name: string): Promise<Permission | null> {
    return this.prisma.permission.findUnique({ where: { name } });
  }

  async findAll(): Promise<Permission[]> {
    return this.prisma.permission.findMany({ orderBy: { name: 'asc' } });
  }

  async create(name: string, description?: string): Promise<Permission> {
    return this.prisma.permission.create({
      data: { name, description },
    });
  }
}

class PrismaSessionRepository implements ISessionRepository {
  constructor(private readonly prisma: any) {}

  async create(data: CreateSessionInput): Promise<Session> {
    return this.prisma.session.create({ data });
  }

  async findById(id: string): Promise<Session | null> {
    return this.prisma.session.findUnique({ where: { id } });
  }

  async findByTokenHash(tokenHash: string): Promise<Session | null> {
    return this.prisma.session.findUnique({ where: { token_hash: tokenHash } });
  }

  async findActiveByUserId(userId: string): Promise<Session[]> {
    return this.prisma.session.findMany({
      where: {
        user_id: userId,
        is_revoked: false,
        expires_at: { gt: new Date() },
      },
      orderBy: { last_activity: 'desc' },
    });
  }

  async updateActivity(id: string, ipAddress?: string): Promise<void> {
    const data: any = { last_activity: new Date() };
    if (ipAddress) data.ip_address = ipAddress;
    await this.prisma.session.update({ where: { id }, data });
  }

  async revoke(id: string): Promise<void> {
    await this.prisma.session.update({
      where: { id },
      data: { is_revoked: true },
    });
  }

  async revokeAllForUser(userId: string, exceptSessionId?: string): Promise<void> {
    const where: any = { user_id: userId };
    if (exceptSessionId) {
      where.id = { not: exceptSessionId };
    }
    await this.prisma.session.updateMany({
      where,
      data: { is_revoked: true },
    });
  }
}

class PrismaRefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private readonly prisma: any) {}

  async create(data: CreateRefreshTokenInput): Promise<RefreshToken> {
    return this.prisma.refreshToken.create({ data });
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findUnique({ where: { token_hash: tokenHash } });
  }

  async revoke(id: string, replacedByTokenHash?: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { id },
      data: {
        is_revoked: true,
        replaced_by_token_hash: replacedByTokenHash,
      },
    });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { user_id: userId },
      data: { is_revoked: true },
    });
  }
}

class PrismaPasswordResetRepository implements IPasswordResetRepository {
  constructor(private readonly prisma: any) {}

  async create(data: CreatePasswordResetInput): Promise<PasswordReset> {
    return this.prisma.passwordReset.create({ data });
  }

  async findValidByTokenHash(tokenHash: string): Promise<PasswordReset | null> {
    return this.prisma.passwordReset.findFirst({
      where: {
        token_hash: tokenHash,
        is_used: false,
        expires_at: { gt: new Date() },
      },
    });
  }

  async markAsUsed(id: string): Promise<void> {
    await this.prisma.passwordReset.update({
      where: { id },
      data: { is_used: true },
    });
  }

  async invalidateExistingForUser(userId: string): Promise<void> {
    await this.prisma.passwordReset.updateMany({
      where: { user_id: userId, is_used: false },
      data: { is_used: true },
    });
  }
}

class PrismaEmailVerificationRepository implements IEmailVerificationRepository {
  constructor(private readonly prisma: any) {}

  async create(data: CreateEmailVerificationInput): Promise<EmailVerification> {
    return this.prisma.emailVerification.create({ data });
  }

  async findValidByTokenHash(tokenHash: string): Promise<EmailVerification | null> {
    return this.prisma.emailVerification.findFirst({
      where: {
        token_hash: tokenHash,
        is_used: false,
        expires_at: { gt: new Date() },
      },
    });
  }

  async markAsUsed(id: string): Promise<void> {
    await this.prisma.emailVerification.update({
      where: { id },
      data: { is_used: true },
    });
  }

  async invalidateExistingForUser(userId: string): Promise<void> {
    await this.prisma.emailVerification.updateMany({
      where: { user_id: userId, is_used: false },
      data: { is_used: true },
    });
  }
}

class PrismaAuditLogRepository implements IAuditLogRepository {
  constructor(private readonly prisma: any) {}

  async create(data: CreateAuditLogInput): Promise<AuditLog> {
    return this.prisma.auditLog.create({ data });
  }

  async findByUserId(userId: string, limit = 50, offset = 0): Promise<AuditLog[]> {
    return this.prisma.auditLog.findMany({
      where: { user_id: userId },
      take: limit,
      skip: offset,
      orderBy: { created_at: 'desc' },
    });
  }

  async findAll(limit = 100, offset = 0): Promise<AuditLog[]> {
    return this.prisma.auditLog.findMany({
      take: limit,
      skip: offset,
      orderBy: { created_at: 'desc' },
    });
  }
}
