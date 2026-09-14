export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name?: string | null;
  last_name?: string | null;
  is_active: boolean;
  is_email_verified: boolean;
  two_factor_enabled: boolean;
  two_factor_secret?: string | null;
  two_factor_recovery_codes?: string[] | null;
  metadata?: Record<string, any> | null;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export interface Role {
  id: string;
  name: string;
  description?: string | null;
  is_default?: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Permission {
  id: string;
  name: string; // e.g. "users.create", "roles.*", "*"
  description?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Session {
  id: string;
  user_id: string;
  token_hash: string;
  ip_address?: string | null;
  user_agent?: string | null;
  device?: string | null;
  is_revoked: boolean;
  last_activity: Date;
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface RefreshToken {
  id: string;
  user_id: string;
  session_id?: string | null;
  token_hash: string;
  is_revoked: boolean;
  replaced_by_token_hash?: string | null;
  expires_at: Date;
  created_at: Date;
}

export interface PasswordReset {
  id: string;
  user_id: string;
  token_hash: string;
  is_used: boolean;
  expires_at: Date;
  created_at: Date;
}

export interface EmailVerification {
  id: string;
  user_id: string;
  token_hash: string;
  is_used: boolean;
  expires_at: Date;
  created_at: Date;
}

export interface AuditLog {
  id: string;
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
  created_at: Date;
}
