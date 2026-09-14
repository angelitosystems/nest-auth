import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  BelongsToMany,
  HasMany,
  BelongsTo,
  ForeignKey,
  Index,
} from 'sequelize-typescript';

@Table({ tableName: 'permissions', timestamps: true, underscored: true })
export class PermissionModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Index({ unique: true })
  @Column({ type: DataType.STRING(150), allowNull: false })
  name!: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description?: string;

  @BelongsToMany(() => RoleModel, () => RolePermissionModel)
  roles!: RoleModel[];
}

@Table({ tableName: 'roles', timestamps: true, underscored: true })
export class RoleModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Index({ unique: true })
  @Column({ type: DataType.STRING(100), allowNull: false })
  name!: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description?: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  is_default!: boolean;

  @BelongsToMany(() => PermissionModel, () => RolePermissionModel)
  permissions!: PermissionModel[];

  @BelongsToMany(() => UserModel, () => UserRoleModel)
  users!: UserModel[];
}

@Table({ tableName: 'role_permissions', timestamps: true, underscored: true })
export class RolePermissionModel extends Model {
  @ForeignKey(() => RoleModel)
  @PrimaryKey
  @Column(DataType.UUID)
  role_id!: string;

  @ForeignKey(() => PermissionModel)
  @PrimaryKey
  @Column(DataType.UUID)
  permission_id!: string;
}

@Table({ tableName: 'user_roles', timestamps: true, underscored: true })
export class UserRoleModel extends Model {
  @ForeignKey(() => UserModel)
  @PrimaryKey
  @Column(DataType.UUID)
  user_id!: string;

  @ForeignKey(() => RoleModel)
  @PrimaryKey
  @Column(DataType.UUID)
  role_id!: string;
}

@Table({ tableName: 'users', timestamps: true, paranoid: true, underscored: true })
export class UserModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Index({ unique: true })
  @Column({ type: DataType.STRING(255), allowNull: false })
  email!: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  password_hash!: string;

  @Column({ type: DataType.STRING(100), allowNull: true })
  first_name?: string;

  @Column({ type: DataType.STRING(100), allowNull: true })
  last_name?: string;

  @Index
  @Default(true)
  @Column(DataType.BOOLEAN)
  is_active!: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  is_email_verified!: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  two_factor_enabled!: boolean;

  @Column({ type: DataType.STRING(255), allowNull: true })
  two_factor_secret?: string;

  @Column({ type: DataType.JSON, allowNull: true })
  two_factor_recovery_codes?: string[];

  @Column({ type: DataType.JSON, allowNull: true })
  metadata?: Record<string, any>;

  @BelongsToMany(() => RoleModel, () => UserRoleModel)
  roles!: RoleModel[];

  @HasMany(() => SessionModel)
  sessions!: SessionModel[];

  @HasMany(() => RefreshTokenModel)
  refresh_tokens!: RefreshTokenModel[];

  @HasMany(() => PasswordResetModel)
  password_resets!: PasswordResetModel[];

  @HasMany(() => EmailVerificationModel)
  email_verifications!: EmailVerificationModel[];

  @HasMany(() => AuditLogModel)
  audit_logs!: AuditLogModel[];
}

@Table({ tableName: 'sessions', timestamps: true, underscored: true })
export class SessionModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => UserModel)
  @Index
  @Column(DataType.UUID)
  user_id!: string;

  @Index({ unique: true })
  @Column({ type: DataType.STRING(255), allowNull: false })
  token_hash!: string;

  @Column({ type: DataType.STRING(45), allowNull: true })
  ip_address?: string;

  @Column({ type: DataType.STRING(500), allowNull: true })
  user_agent?: string;

  @Column({ type: DataType.STRING(100), allowNull: true })
  device?: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  is_revoked!: boolean;

  @Default(DataType.NOW)
  @Column(DataType.DATE)
  last_activity!: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  expires_at!: Date;

  @BelongsTo(() => UserModel)
  user!: UserModel;
}

@Table({ tableName: 'refresh_tokens', timestamps: true, underscored: true })
export class RefreshTokenModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => UserModel)
  @Index
  @Column(DataType.UUID)
  user_id!: string;

  @Column({ type: DataType.UUID, allowNull: true })
  session_id?: string;

  @Index({ unique: true })
  @Column({ type: DataType.STRING(255), allowNull: false })
  token_hash!: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  is_revoked!: boolean;

  @Column({ type: DataType.STRING(255), allowNull: true })
  replaced_by_token_hash?: string;

  @Column({ type: DataType.DATE, allowNull: false })
  expires_at!: Date;

  @BelongsTo(() => UserModel)
  user!: UserModel;
}

@Table({ tableName: 'password_resets', timestamps: true, underscored: true })
export class PasswordResetModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => UserModel)
  @Index
  @Column(DataType.UUID)
  user_id!: string;

  @Index({ unique: true })
  @Column({ type: DataType.STRING(255), allowNull: false })
  token_hash!: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  is_used!: boolean;

  @Column({ type: DataType.DATE, allowNull: false })
  expires_at!: Date;

  @BelongsTo(() => UserModel)
  user!: UserModel;
}

@Table({ tableName: 'email_verifications', timestamps: true, underscored: true })
export class EmailVerificationModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => UserModel)
  @Index
  @Column(DataType.UUID)
  user_id!: string;

  @Index({ unique: true })
  @Column({ type: DataType.STRING(255), allowNull: false })
  token_hash!: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  is_used!: boolean;

  @Column({ type: DataType.DATE, allowNull: false })
  expires_at!: Date;

  @BelongsTo(() => UserModel)
  user!: UserModel;
}

@Table({ tableName: 'audit_logs', timestamps: true, underscored: true })
export class AuditLogModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => UserModel)
  @Index
  @Column({ type: DataType.UUID, allowNull: true })
  user_id?: string;

  @Index
  @Column({ type: DataType.STRING(100), allowNull: false })
  action!: string;

  @Index
  @Column({ type: DataType.STRING(100), allowNull: false })
  entity!: string;

  @Column({ type: DataType.STRING(255), allowNull: true })
  entity_id?: string;

  @Column({ type: DataType.STRING(20), allowNull: true })
  method?: string;

  @Column({ type: DataType.STRING(500), allowNull: true })
  route?: string;

  @Column({ type: DataType.STRING(45), allowNull: true })
  ip?: string;

  @Column({ type: DataType.STRING(500), allowNull: true })
  user_agent?: string;

  @Column({ type: DataType.JSON, allowNull: true })
  old_values?: Record<string, any>;

  @Column({ type: DataType.JSON, allowNull: true })
  new_values?: Record<string, any>;

  @Column({ type: DataType.JSON, allowNull: true })
  metadata?: Record<string, any>;

  @BelongsTo(() => UserModel)
  user?: UserModel;
}

export const AUTH_MODELS = [
  UserModel,
  RoleModel,
  PermissionModel,
  UserRoleModel,
  RolePermissionModel,
  SessionModel,
  RefreshTokenModel,
  PasswordResetModel,
  EmailVerificationModel,
  AuditLogModel,
];
