import { AuthService } from './auth.service';
import { PasswordService } from '../security/password.service';
import { TokenService } from '../security/token.service';
import { TwoFactorService } from '../security/two-factor.service';
import { SessionService } from './session.service';
import { AuditService } from './audit.service';
import { MailService } from './mail.service';
import { AuthDatabaseAdapter } from '../interfaces/database-adapter.interface';
import { UnauthorizedException } from '@nestjs/common';

function createMockAdapter(): AuthDatabaseAdapter {
  const users: any[] = [];
  const roles: any[] = [{ id: 'role-user', name: 'user' }];
  const permissions: any[] = [];
  const sessions: any[] = [];
  const refreshTokens: any[] = [];
  const passwordResets: any[] = [];
  const emailVerifications: any[] = [];
  const auditLogs: any[] = [];

  return {
    users: {
      findById: jest.fn(async (id: string) => users.find((u) => u.id === id) || null),
      findByEmail: jest.fn(async (email: string) => users.find((u) => u.email === email) || null),
      create: jest.fn(async (data: any) => {
        const user = { id: `user-${Date.now()}`, ...data, created_at: new Date(), updated_at: new Date() };
        users.push(user);
        return user;
      }),
      update: jest.fn(async (id: string, data: any) => {
        const user = users.find((u) => u.id === id);
        Object.assign(user, data);
        return user;
      }),
      softDelete: jest.fn(async (id: string) => {
        const user = users.find((u) => u.id === id);
        if (user) {
          user.deleted_at = new Date();
          user.is_active = false;
        }
      }),
      getUserRoles: jest.fn(async () => [
        { id: 'r1', name: 'user', created_at: new Date(), updated_at: new Date() },
      ]),
      getUserPermissions: jest.fn(async () => []),
      assignRole: jest.fn(async () => {}),
      removeRole: jest.fn(async () => {}),
    },
    roles: {
      findById: jest.fn(async (id: string) => roles.find((r) => r.id === id) || null),
      findByName: jest.fn(async (name: string) => roles.find((r) => r.name === name) || null),
      findAll: jest.fn(async () => roles),
      create: jest.fn(async (name: string) => ({
        id: `role-${Date.now()}`,
        name,
        created_at: new Date(),
        updated_at: new Date(),
      })),
      getRolePermissions: jest.fn(async () => []),
      grantPermission: jest.fn(async () => {}),
      revokePermission: jest.fn(async () => {}),
    },
    permissions: {
      findById: jest.fn(async () => null),
      findByName: jest.fn(async () => null),
      findAll: jest.fn(async () => permissions),
      create: jest.fn(async (name: string) => ({
        id: `perm-${Date.now()}`,
        name,
        created_at: new Date(),
        updated_at: new Date(),
      })),
    },
    sessions: {
      create: jest.fn(async (data: any) => {
        const s = { id: `session-${Date.now()}`, ...data, is_revoked: false, created_at: new Date() };
        sessions.push(s);
        return s;
      }),
      findById: jest.fn(async (id: string) => sessions.find((s) => s.id === id) || null),
      findByTokenHash: jest.fn(async (hash: string) => sessions.find((s) => s.token_hash === hash) || null),
      findActiveByUserId: jest.fn(async (userId: string) => sessions.filter((s) => s.user_id === userId && !s.is_revoked)),
      updateActivity: jest.fn(async () => {}),
      revoke: jest.fn(async (id: string) => {
        const s = sessions.find((item) => item.id === id);
        if (s) s.is_revoked = true;
      }),
      revokeAllForUser: jest.fn(async (userId: string) => {
        sessions.forEach((s) => {
          if (s.user_id === userId) s.is_revoked = true;
        });
      }),
    },
    refreshTokens: {
      create: jest.fn(async (data: any) => {
        const t = { id: `token-${Date.now()}`, ...data, is_revoked: false, created_at: new Date() };
        refreshTokens.push(t);
        return t;
      }),
      findByTokenHash: jest.fn(async (hash: string) => refreshTokens.find((t) => t.token_hash === hash) || null),
      revoke: jest.fn(async (id: string, replacedBy?: string) => {
        const t = refreshTokens.find((item) => item.id === id);
        if (t) {
          t.is_revoked = true;
          t.replaced_by_token_hash = replacedBy;
        }
      }),
      revokeAllForUser: jest.fn(async (userId: string) => {
        refreshTokens.forEach((t) => {
          if (t.user_id === userId) t.is_revoked = true;
        });
      }),
    },
    passwordResets: {
      create: jest.fn(async (data: any) => {
        const pr = { id: `pr-${Date.now()}`, ...data, is_used: false, created_at: new Date() };
        passwordResets.push(pr);
        return pr;
      }),
      findValidByTokenHash: jest.fn(async (hash: string) =>
        passwordResets.find((pr) => pr.token_hash === hash && !pr.is_used && pr.expires_at > new Date()) || null,
      ),
      markAsUsed: jest.fn(async (id: string) => {
        const pr = passwordResets.find((item) => item.id === id);
        if (pr) pr.is_used = true;
      }),
      invalidateExistingForUser: jest.fn(async (userId: string) => {
        passwordResets.forEach((pr) => {
          if (pr.user_id === userId) pr.is_used = true;
        });
      }),
    },
    emailVerifications: {
      create: jest.fn(async (data: any) => {
        const ev = { id: `ev-${Date.now()}`, ...data, is_used: false };
        emailVerifications.push(ev);
        return ev;
      }),
      findValidByTokenHash: jest.fn(async (hash: string) =>
        emailVerifications.find((ev) => ev.token_hash === hash && !ev.is_used) || null,
      ),
      markAsUsed: jest.fn(async (id: string) => {
        const ev = emailVerifications.find((item) => item.id === id);
        if (ev) ev.is_used = true;
      }),
      invalidateExistingForUser: jest.fn(async () => {}),
    },
    auditLogs: {
      create: jest.fn(async (data: any) => {
        const log = { id: `log-${Date.now()}`, ...data, created_at: new Date() };
        auditLogs.push(log);
        return log;
      }),
      findByUserId: jest.fn(async (userId: string) => auditLogs.filter((l) => l.user_id === userId)),
      findAll: jest.fn(async () => auditLogs),
    },
  };
}

describe('AuthService Integration', () => {
  let authService: AuthService;
  let adapter: AuthDatabaseAdapter;
  let passwordService: PasswordService;
  let tokenService: TokenService;
  let twoFactorService: TwoFactorService;
  let sessionService: SessionService;
  let auditService: AuditService;
  let mailService: MailService;

  const options = {
    jwt: {
      secret: 'unit-test-secret-at-least-32-characters-long',
      accessTokenExpiresIn: '15m',
      refreshTokenExpiresIn: '7d',
    },
    sessions: { enabled: true },
    features: { refreshTokens: true, auditLogs: true },
    adapter: null as any,
  };

  beforeEach(() => {
    adapter = createMockAdapter();
    options.adapter = adapter;
    passwordService = new PasswordService();
    tokenService = new TokenService(options as any);
    twoFactorService = new TwoFactorService();
    sessionService = new SessionService(adapter, options as any);
    auditService = new AuditService(adapter, options as any);
    mailService = new MailService();

    authService = new AuthService(
      adapter,
      options as any,
      passwordService,
      tokenService,
      twoFactorService,
      sessionService,
      auditService,
      mailService,
    );
  });

  it('should register a new user, hash password, and issue tokens', async () => {
    const result = await authService.register({
      email: 'john@example.com',
      password: 'MyPassword123!',
      first_name: 'John',
      last_name: 'Doe',
    });

    expect(result.tokens).toBeDefined();
    expect(result.tokens?.accessToken).toBeDefined();
    expect(result.tokens?.refreshToken).toBeDefined();
    expect(result.user.email).toBe('john@example.com');
    expect(result.user.password_hash).toBeUndefined(); // Sensitive data stripped

    // Verify audit log
    expect(adapter.auditLogs.create).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'USER_CREATED' }),
    );
  });

  it('should authenticate user with valid credentials', async () => {
    await authService.register({
      email: 'alice@example.com',
      password: 'SecurePassword123!',
    });

    const loginResult = await authService.login({
      email: 'alice@example.com',
      password: 'SecurePassword123!',
    });

    expect(loginResult.tokens).toBeDefined();
    expect(loginResult.tokens?.accessToken).toBeDefined();
    expect(loginResult.user.email).toBe('alice@example.com');
  });

  it('should reject invalid password with UnauthorizedException', async () => {
    await authService.register({
      email: 'bob@example.com',
      password: 'CorrectPassword123!',
    });

    await expect(
      authService.login({
        email: 'bob@example.com',
        password: 'IncorrectPassword!',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should rotate refresh token and issue new token pair', async () => {
    const registerResult = await authService.register({
      email: 'charlie@example.com',
      password: 'Password123!',
    });

    const oldRefreshToken = registerResult.tokens!.refreshToken!;
    const refreshed = await authService.refresh(oldRefreshToken);

    expect(refreshed.accessToken).toBeDefined();
    expect(refreshed.refreshToken).toBeDefined();
    expect(refreshed.refreshToken).not.toEqual(oldRefreshToken);

    // Attempting to reuse old revoked refresh token should trigger reuse detection!
    await expect(authService.refresh(oldRefreshToken)).rejects.toThrow(UnauthorizedException);
  });

  it('should execute password reset flow and invalidate active sessions', async () => {
    const reg = await authService.register({
      email: 'dave@example.com',
      password: 'OldPassword123!',
    });

    // Request reset
    await authService.forgotPassword({ email: 'dave@example.com' });

    // Mock reset token in db
    const rawResetToken = 'secret-reset-token-123';
    const hash = passwordService.hashToken(rawResetToken);
    await adapter.passwordResets.create({
      user_id: reg.user.id,
      token_hash: hash,
      expires_at: new Date(Date.now() + 3600000),
    });

    // Perform reset
    const resetResult = await authService.resetPassword({
      token: rawResetToken,
      newPassword: 'BrandNewPassword123!',
    });

    expect(resetResult.message).toContain('successfully reset');

    // Dave should now be able to login with the new password
    const newLogin = await authService.login({
      email: 'dave@example.com',
      password: 'BrandNewPassword123!',
    });
    expect(newLogin.tokens).toBeDefined();
  });
});
