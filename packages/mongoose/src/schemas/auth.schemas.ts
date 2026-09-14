import { Schema, Document } from 'mongoose';

export const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    password_hash: { type: String, required: true },
    first_name: { type: String, default: null },
    last_name: { type: String, default: null },
    is_active: { type: Boolean, default: true, index: true },
    is_email_verified: { type: Boolean, default: false },
    two_factor_enabled: { type: Boolean, default: false },
    two_factor_secret: { type: String, default: null },
    two_factor_recovery_codes: { type: [String], default: [] },
    roles: [{ type: Schema.Types.ObjectId, ref: 'Role' }],
    metadata: { type: Schema.Types.Mixed, default: {} },
    deleted_at: { type: Date, default: null },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

export const RoleSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: null },
    is_default: { type: Boolean, default: false },
    permissions: [{ type: Schema.Types.ObjectId, ref: 'Permission' }],
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

export const PermissionSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: null },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

export const SessionSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    token_hash: { type: String, required: true, unique: true, index: true },
    ip_address: { type: String, default: null },
    user_agent: { type: String, default: null },
    device: { type: String, default: null },
    is_revoked: { type: Boolean, default: false },
    last_activity: { type: Date, default: Date.now },
    expires_at: { type: Date, required: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

export const RefreshTokenSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    session_id: { type: Schema.Types.ObjectId, ref: 'Session', default: null },
    token_hash: { type: String, required: true, unique: true, index: true },
    is_revoked: { type: Boolean, default: false },
    replaced_by_token_hash: { type: String, default: null },
    expires_at: { type: Date, required: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

export const PasswordResetSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    token_hash: { type: String, required: true, unique: true, index: true },
    is_used: { type: Boolean, default: false },
    expires_at: { type: Date, required: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

export const EmailVerificationSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    token_hash: { type: String, required: true, unique: true, index: true },
    is_used: { type: Boolean, default: false },
    expires_at: { type: Date, required: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

export const AuditLogSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    action: { type: String, required: true, index: true },
    entity: { type: String, required: true, index: true },
    entity_id: { type: String, default: null },
    method: { type: String, default: null },
    route: { type: String, default: null },
    ip: { type: String, default: null },
    user_agent: { type: String, default: null },
    old_values: { type: Schema.Types.Mixed, default: null },
    new_values: { type: Schema.Types.Mixed, default: null },
    metadata: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } },
);
