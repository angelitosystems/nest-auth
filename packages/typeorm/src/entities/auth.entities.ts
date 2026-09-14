import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
  OneToMany,
  Index,
  JoinColumn,
} from 'typeorm';

@Entity('permissions')
export class PermissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToMany(() => RoleEntity, (role) => role.permissions)
  roles!: RoleEntity[];
}

@Entity('roles')
export class RoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'boolean', default: false })
  is_default!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToMany(() => PermissionEntity, (permission) => permission.roles, { cascade: true })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions!: PermissionEntity[];

  @ManyToMany(() => UserEntity, (user) => user.roles)
  users!: UserEntity[];
}

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  password_hash!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  first_name?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  last_name?: string | null;

  @Index()
  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @Column({ type: 'boolean', default: false })
  is_email_verified!: boolean;

  @Column({ type: 'boolean', default: false })
  two_factor_enabled!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  two_factor_secret?: string | null;

  @Column({ type: 'simple-array', nullable: true })
  two_factor_recovery_codes?: string[] | null;

  @Column({ type: 'simple-json', nullable: true })
  metadata?: Record<string, any> | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_at?: Date | null;

  @ManyToMany(() => RoleEntity, (role) => role.users, { cascade: true })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles!: RoleEntity[];

  @OneToMany(() => SessionEntity, (session) => session.user)
  sessions!: SessionEntity[];

  @OneToMany(() => RefreshTokenEntity, (token) => token.user)
  refresh_tokens!: RefreshTokenEntity[];

  @OneToMany(() => PasswordResetEntity, (pr) => pr.user)
  password_resets!: PasswordResetEntity[];

  @OneToMany(() => EmailVerificationEntity, (ev) => ev.user)
  email_verifications!: EmailVerificationEntity[];

  @OneToMany(() => AuditLogEntity, (log) => log.user)
  audit_logs!: AuditLogEntity[];
}

@Entity('sessions')
export class SessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  user_id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  token_hash!: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip_address?: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  user_agent?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  device?: string | null;

  @Column({ type: 'boolean', default: false })
  is_revoked!: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  last_activity!: Date;

  @Column({ type: 'timestamp' })
  expires_at!: Date;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToOne(() => UserEntity, (user) => user.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;
}

@Entity('refresh_tokens')
export class RefreshTokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  user_id!: string;

  @Column({ type: 'uuid', nullable: true })
  session_id?: string | null;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  token_hash!: string;

  @Column({ type: 'boolean', default: false })
  is_revoked!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  replaced_by_token_hash?: string | null;

  @Column({ type: 'timestamp' })
  expires_at!: Date;

  @CreateDateColumn()
  created_at!: Date;

  @ManyToOne(() => UserEntity, (user) => user.refresh_tokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;
}

@Entity('password_resets')
export class PasswordResetEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  user_id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  token_hash!: string;

  @Column({ type: 'boolean', default: false })
  is_used!: boolean;

  @Column({ type: 'timestamp' })
  expires_at!: Date;

  @CreateDateColumn()
  created_at!: Date;

  @ManyToOne(() => UserEntity, (user) => user.password_resets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;
}

@Entity('email_verifications')
export class EmailVerificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  user_id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  token_hash!: string;

  @Column({ type: 'boolean', default: false })
  is_used!: boolean;

  @Column({ type: 'timestamp' })
  expires_at!: Date;

  @CreateDateColumn()
  created_at!: Date;

  @ManyToOne(() => UserEntity, (user) => user.email_verifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;
}

@Entity('audit_logs')
export class AuditLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  user_id?: string | null;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  action!: string;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  entity!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  entity_id?: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  method?: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  route?: string | null;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip?: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  user_agent?: string | null;

  @Column({ type: 'simple-json', nullable: true })
  old_values?: Record<string, any> | null;

  @Column({ type: 'simple-json', nullable: true })
  new_values?: Record<string, any> | null;

  @Column({ type: 'simple-json', nullable: true })
  metadata?: Record<string, any> | null;

  @CreateDateColumn()
  created_at!: Date;

  @ManyToOne(() => UserEntity, (user) => user.audit_logs, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity | null;
}

export const AUTH_ENTITIES = [
  UserEntity,
  RoleEntity,
  PermissionEntity,
  SessionEntity,
  RefreshTokenEntity,
  PasswordResetEntity,
  EmailVerificationEntity,
  AuditLogEntity,
];
