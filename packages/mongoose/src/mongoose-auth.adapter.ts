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
import { Connection, Model } from 'mongoose';
import {
  UserSchema,
  RoleSchema,
  PermissionSchema,
  SessionSchema,
  RefreshTokenSchema,
  PasswordResetSchema,
  EmailVerificationSchema,
  AuditLogSchema,
} from './schemas/auth.schemas';

export class MongooseAuthAdapter implements AuthDatabaseAdapter {
  readonly users: IUserRepository;
  readonly roles: IRoleRepository;
  readonly permissions: IPermissionRepository;
  readonly sessions: ISessionRepository;
  readonly refreshTokens: IRefreshTokenRepository;
  readonly passwordResets: IPasswordResetRepository;
  readonly emailVerifications: IEmailVerificationRepository;
  readonly auditLogs: IAuditLogRepository;

  private userModel: Model<any>;
  private roleModel: Model<any>;
  private permissionModel: Model<any>;
  private sessionModel: Model<any>;
  private refreshTokenModel: Model<any>;
  private passwordResetModel: Model<any>;
  private emailVerificationModel: Model<any>;
  private auditLogModel: Model<any>;

  constructor(private readonly connection: Connection) {
    this.userModel = connection.models['User'] || connection.model('User', UserSchema);
    this.roleModel = connection.models['Role'] || connection.model('Role', RoleSchema);
    this.permissionModel = connection.models['Permission'] || connection.model('Permission', PermissionSchema);
    this.sessionModel = connection.models['Session'] || connection.model('Session', SessionSchema);
    this.refreshTokenModel = connection.models['RefreshToken'] || connection.model('RefreshToken', RefreshTokenSchema);
    this.passwordResetModel = connection.models['PasswordReset'] || connection.model('PasswordReset', PasswordResetSchema);
    this.emailVerificationModel = connection.models['EmailVerification'] || connection.model('EmailVerification', EmailVerificationSchema);
    this.auditLogModel = connection.models['AuditLog'] || connection.model('AuditLog', AuditLogSchema);

    this.users = new MongooseUserRepository(this.userModel, this.roleModel);
    this.roles = new MongooseRoleRepository(this.roleModel, this.permissionModel);
    this.permissions = new MongoosePermissionRepository(this.permissionModel);
    this.sessions = new MongooseSessionRepository(this.sessionModel);
    this.refreshTokens = new MongooseRefreshTokenRepository(this.refreshTokenModel);
    this.passwordResets = new MongoosePasswordResetRepository(this.passwordResetModel);
    this.emailVerifications = new MongooseEmailVerificationRepository(this.emailVerificationModel);
    this.auditLogs = new MongooseAuditLogRepository(this.auditLogModel);
  }

  async destroy(): Promise<void> {
    await this.connection.close();
  }
}

function mapDoc<T>(doc: any): T {
  if (!doc) return doc;
  const obj = doc.toObject ? doc.toObject() : doc;
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  return obj as T;
}

class MongooseUserRepository implements IUserRepository {
  constructor(
    private readonly userModel: Model<any>,
    private readonly roleModel: Model<any>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const doc = await this.userModel.findOne({ _id: id, deleted_at: null });
    return doc ? mapDoc<User>(doc) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await this.userModel.findOne({ email, deleted_at: null });
    return doc ? mapDoc<User>(doc) : null;
  }

  async create(data: CreateUserInput): Promise<User> {
    const created = await this.userModel.create({
      email: data.email,
      password_hash: data.password_hash,
      first_name: data.first_name,
      last_name: data.last_name,
      is_active: data.is_active ?? true,
      is_email_verified: data.is_email_verified ?? false,
      metadata: data.metadata ?? {},
    });
    return mapDoc<User>(created);
  }

  async update(id: string, data: UpdateUserInput): Promise<User> {
    const updated = await this.userModel.findByIdAndUpdate(id, data, { new: true });
    return mapDoc<User>(updated);
  }

  async softDelete(id: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { deleted_at: new Date(), is_active: false });
  }

  async getUserRoles(userId: string): Promise<Role[]> {
    const user = await this.userModel.findById(userId).populate('roles');
    if (!user || !user.roles) return [];
    return user.roles.map((r: any) => mapDoc<Role>(r));
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    const user = await this.userModel.findById(userId).populate({
      path: 'roles',
      populate: { path: 'permissions' },
    });
    if (!user || !user.roles) return [];

    const permissionMap = new Map<string, Permission>();
    for (const role of user.roles) {
      if (role.permissions) {
        for (const perm of role.permissions) {
          permissionMap.set(perm._id.toString(), mapDoc<Permission>(perm));
        }
      }
    }
    return Array.from(permissionMap.values());
  }

  async assignRole(userId: string, roleName: string): Promise<void> {
    const role = await this.roleModel.findOne({ name: roleName });
    if (!role) return;

    await this.userModel.findByIdAndUpdate(userId, {
      $addToSet: { roles: role._id },
    });
  }

  async removeRole(userId: string, roleName: string): Promise<void> {
    const role = await this.roleModel.findOne({ name: roleName });
    if (!role) return;

    await this.userModel.findByIdAndUpdate(userId, {
      $pull: { roles: role._id },
    });
  }
}

class MongooseRoleRepository implements IRoleRepository {
  constructor(
    private readonly roleModel: Model<any>,
    private readonly permissionModel: Model<any>,
  ) {}

  async findById(id: string): Promise<Role | null> {
    const doc = await this.roleModel.findById(id);
    return doc ? mapDoc<Role>(doc) : null;
  }

  async findByName(name: string): Promise<Role | null> {
    const doc = await this.roleModel.findOne({ name });
    return doc ? mapDoc<Role>(doc) : null;
  }

  async findAll(): Promise<Role[]> {
    const docs = await this.roleModel.find().sort({ name: 1 });
    return docs.map((d) => mapDoc<Role>(d));
  }

  async create(name: string, description?: string, isDefault = false): Promise<Role> {
    const created = await this.roleModel.create({
      name,
      description,
      is_default: isDefault,
    });
    return mapDoc<Role>(created);
  }

  async getRolePermissions(roleId: string): Promise<Permission[]> {
    const role = await this.roleModel.findById(roleId).populate('permissions');
    if (!role || !role.permissions) return [];
    return role.permissions.map((p: any) => mapDoc<Permission>(p));
  }

  async grantPermission(roleId: string, permissionName: string): Promise<void> {
    const perm = await this.permissionModel.findOne({ name: permissionName });
    if (!perm) return;

    await this.roleModel.findByIdAndUpdate(roleId, {
      $addToSet: { permissions: perm._id },
    });
  }

  async revokePermission(roleId: string, permissionName: string): Promise<void> {
    const perm = await this.permissionModel.findOne({ name: permissionName });
    if (!perm) return;

    await this.roleModel.findByIdAndUpdate(roleId, {
      $pull: { permissions: perm._id },
    });
  }
}

class MongoosePermissionRepository implements IPermissionRepository {
  constructor(private readonly permissionModel: Model<any>) {}

  async findById(id: string): Promise<Permission | null> {
    const doc = await this.permissionModel.findById(id);
    return doc ? mapDoc<Permission>(doc) : null;
  }

  async findByName(name: string): Promise<Permission | null> {
    const doc = await this.permissionModel.findOne({ name });
    return doc ? mapDoc<Permission>(doc) : null;
  }

  async findAll(): Promise<Permission[]> {
    const docs = await this.permissionModel.find().sort({ name: 1 });
    return docs.map((d) => mapDoc<Permission>(d));
  }

  async create(name: string, description?: string): Promise<Permission> {
    const created = await this.permissionModel.create({ name, description });
    return mapDoc<Permission>(created);
  }
}

class MongooseSessionRepository implements ISessionRepository {
  constructor(private readonly sessionModel: Model<any>) {}

  async create(data: CreateSessionInput): Promise<Session> {
    const created = await this.sessionModel.create(data);
    return mapDoc<Session>(created);
  }

  async findById(id: string): Promise<Session | null> {
    const doc = await this.sessionModel.findById(id);
    return doc ? mapDoc<Session>(doc) : null;
  }

  async findByTokenHash(tokenHash: string): Promise<Session | null> {
    const doc = await this.sessionModel.findOne({ token_hash: tokenHash });
    return doc ? mapDoc<Session>(doc) : null;
  }

  async findActiveByUserId(userId: string): Promise<Session[]> {
    const docs = await this.sessionModel
      .find({
        user_id: userId,
        is_revoked: false,
        expires_at: { $gt: new Date() },
      })
      .sort({ last_activity: -1 });
    return docs.map((d) => mapDoc<Session>(d));
  }

  async updateActivity(id: string, ipAddress?: string): Promise<void> {
    const update: any = { last_activity: new Date() };
    if (ipAddress) update.ip_address = ipAddress;
    await this.sessionModel.findByIdAndUpdate(id, update);
  }

  async revoke(id: string): Promise<void> {
    await this.sessionModel.findByIdAndUpdate(id, { is_revoked: true });
  }

  async revokeAllForUser(userId: string, exceptSessionId?: string): Promise<void> {
    const filter: any = { user_id: userId };
    if (exceptSessionId) {
      filter._id = { $ne: exceptSessionId };
    }
    await this.sessionModel.updateMany(filter, { is_revoked: true });
  }
}

class MongooseRefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private readonly tokenModel: Model<any>) {}

  async create(data: CreateRefreshTokenInput): Promise<RefreshToken> {
    const created = await this.tokenModel.create(data);
    return mapDoc<RefreshToken>(created);
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    const doc = await this.tokenModel.findOne({ token_hash: tokenHash });
    return doc ? mapDoc<RefreshToken>(doc) : null;
  }

  async revoke(id: string, replacedByTokenHash?: string): Promise<void> {
    await this.tokenModel.findByIdAndUpdate(id, {
      is_revoked: true,
      replaced_by_token_hash: replacedByTokenHash,
    });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.tokenModel.updateMany({ user_id: userId }, { is_revoked: true });
  }
}

class MongoosePasswordResetRepository implements IPasswordResetRepository {
  constructor(private readonly prModel: Model<any>) {}

  async create(data: CreatePasswordResetInput): Promise<PasswordReset> {
    const created = await this.prModel.create(data);
    return mapDoc<PasswordReset>(created);
  }

  async findValidByTokenHash(tokenHash: string): Promise<PasswordReset | null> {
    const doc = await this.prModel.findOne({
      token_hash: tokenHash,
      is_used: false,
      expires_at: { $gt: new Date() },
    });
    return doc ? mapDoc<PasswordReset>(doc) : null;
  }

  async markAsUsed(id: string): Promise<void> {
    await this.prModel.findByIdAndUpdate(id, { is_used: true });
  }

  async invalidateExistingForUser(userId: string): Promise<void> {
    await this.prModel.updateMany({ user_id: userId, is_used: false }, { is_used: true });
  }
}

class MongooseEmailVerificationRepository implements IEmailVerificationRepository {
  constructor(private readonly evModel: Model<any>) {}

  async create(data: CreateEmailVerificationInput): Promise<EmailVerification> {
    const created = await this.evModel.create(data);
    return mapDoc<EmailVerification>(created);
  }

  async findValidByTokenHash(tokenHash: string): Promise<EmailVerification | null> {
    const doc = await this.evModel.findOne({
      token_hash: tokenHash,
      is_used: false,
      expires_at: { $gt: new Date() },
    });
    return doc ? mapDoc<EmailVerification>(doc) : null;
  }

  async markAsUsed(id: string): Promise<void> {
    await this.evModel.findByIdAndUpdate(id, { is_used: true });
  }

  async invalidateExistingForUser(userId: string): Promise<void> {
    await this.evModel.updateMany({ user_id: userId, is_used: false }, { is_used: true });
  }
}

class MongooseAuditLogRepository implements IAuditLogRepository {
  constructor(private readonly auditModel: Model<any>) {}

  async create(data: CreateAuditLogInput): Promise<AuditLog> {
    const created = await this.auditModel.create(data);
    return mapDoc<AuditLog>(created);
  }

  async findByUserId(userId: string, limit = 50, offset = 0): Promise<AuditLog[]> {
    const docs = await this.auditModel
      .find({ user_id: userId })
      .sort({ created_at: -1 })
      .skip(offset)
      .limit(limit);
    return docs.map((d) => mapDoc<AuditLog>(d));
  }

  async findAll(limit = 100, offset = 0): Promise<AuditLog[]> {
    const docs = await this.auditModel
      .find()
      .sort({ created_at: -1 })
      .skip(offset)
      .limit(limit);
    return docs.map((d) => mapDoc<AuditLog>(d));
  }
}
