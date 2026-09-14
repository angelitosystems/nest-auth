import { ModuleMetadata, Type } from '@nestjs/common';
import { AuthDatabaseAdapter } from './database-adapter.interface';
import { MailProvider } from './mail-provider.interface';

export interface JwtConfig {
  secret: string;
  accessTokenExpiresIn?: string | number; // e.g. '15m' or seconds
  refreshTokenExpiresIn?: string | number; // e.g. '7d' or seconds
  issuer?: string;
  audience?: string;
}

export interface CookieConfig {
  enabled: boolean;
  name?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'lax' | 'strict' | 'none' | boolean;
  domain?: string;
  path?: string;
  maxAge?: number; // milliseconds
}

export interface SessionConfig {
  enabled: boolean;
  maxConcurrentSessions?: number;
  trackDevice?: boolean;
}

export interface SecurityConfig {
  bcryptSaltRounds?: number;
  passwordMinLength?: number;
  maxLoginAttempts?: number;
  lockoutDurationSeconds?: number;
  rolesMode?: 'OR' | 'AND';
}

export interface FeatureConfig {
  emailVerification?: boolean;
  passwordReset?: boolean;
  twoFactor?: boolean;
  auditLogs?: boolean;
  roles?: boolean;
  permissions?: boolean;
  refreshTokens?: boolean;
}

export interface AuthModuleOptions {
  jwt: JwtConfig;
  cookies?: CookieConfig;
  sessions?: SessionConfig;
  security?: SecurityConfig;
  features?: FeatureConfig;
  adapter: AuthDatabaseAdapter;
  mailProvider?: MailProvider;
  globalGuard?: boolean;
  controllers?: boolean | {
    auth?: boolean;
  };
}

export interface AuthModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (...args: any[]) => Promise<AuthModuleOptions> | AuthModuleOptions;
  inject?: any[];
}
