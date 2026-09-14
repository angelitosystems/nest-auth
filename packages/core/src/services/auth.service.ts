import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  Optional,
  UnauthorizedException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  AUTH_DATABASE_ADAPTER,
  AUTH_MODULE_OPTIONS,
} from '../constants/auth.constants';
import { AuthDatabaseAdapter } from '../interfaces/database-adapter.interface';
import { AuthModuleOptions } from '../interfaces/auth-module-options.interface';
import { PasswordService } from '../security/password.service';
import { TokenService, TokenPair } from '../security/token.service';
import { TwoFactorService } from '../security/two-factor.service';
import { SessionService } from './session.service';
import { AuditService } from './audit.service';
import { MailService } from './mail.service';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from '../dto/auth.dto';
import {
  UserRegisteredEvent,
  UserLoggedInEvent,
  UserLoginFailedEvent,
  UserLoggedOutEvent,
  PasswordResetRequestedEvent,
  PasswordResetEvent,
  EmailVerifiedEvent,
} from '../events/auth.events';

export interface LoginResult {
  requiresTwoFactor?: boolean;
  twoFactorToken?: string;
  tokens?: TokenPair;
  user?: any;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(AUTH_DATABASE_ADAPTER)
    private readonly adapter: AuthDatabaseAdapter,
    @Inject(AUTH_MODULE_OPTIONS)
    private readonly options: AuthModuleOptions,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly twoFactorService: TwoFactorService,
    private readonly sessionService: SessionService,
    private readonly auditService: AuditService,
    private readonly mailService: MailService,
    @Optional()
    private readonly eventEmitter?: EventEmitter2,
  ) {}

  /**
   * Register a new user
   */
  async register(
    dto: RegisterDto,
    req?: { ip?: string; headers?: Record<string, any> },
  ): Promise<{ message: string; tokens?: TokenPair; user?: any }> {
    const existing = await this.adapter.users.findByEmail(dto.email.toLowerCase().trim());
    if (existing) {
      throw new ConflictException('A user with this email address already exists');
    }

    const passwordHash = await this.passwordService.hash(dto.password);
    const requireEmailVerification = this.options.features?.emailVerification === true;

    const user = await this.adapter.users.create({
      email: dto.email.toLowerCase().trim(),
      password_hash: passwordHash,
      first_name: dto.first_name || null,
      last_name: dto.last_name || null,
      is_active: true,
      is_email_verified: !requireEmailVerification,
    });

    // Assign default role if configured
    const defaultRole = await this.adapter.roles.findByName('user');
    if (defaultRole) {
      await this.adapter.users.assignRole(user.id, defaultRole.name);
    }

    // Audit log for user creation
    await this.auditService.log({
      user_id: user.id,
      action: 'USER_CREATED',
      entity: 'USER',
      entity_id: user.id,
      ip: req?.ip,
      user_agent: req?.headers?.['user-agent'],
      new_values: { email: user.email, first_name: user.first_name, last_name: user.last_name },
    });

    let verificationToken: string | undefined;
    if (requireEmailVerification) {
      verificationToken = this.passwordService.generateRandomToken(32);
      const tokenHash = this.passwordService.hashToken(verificationToken);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await this.adapter.emailVerifications.create({
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
      });

      await this.mailService.sendVerificationEmail(user.email, verificationToken);
    }

    this.emitEvent('auth.registered', new UserRegisteredEvent(user, verificationToken));

    if (requireEmailVerification) {
      return {
        message: 'Registration successful. Please verify your email before logging in.',
        user: this.sanitizeUser(user),
      };
    }

    // Direct login session & tokens
    let session;
    if (this.options.sessions?.enabled) {
      session = await this.sessionService.createSession(user.id, req);
    }

    const roles = await this.adapter.users.getUserRoles(user.id);
    const permissions = await this.adapter.users.getUserPermissions(user.id);

    const tokens = this.tokenService.createTokenPair({
      sub: user.id,
      email: user.email,
      roles: roles.map((r) => r.name),
      permissions: permissions.map((p) => p.name),
      sessionId: session?.id,
    });

    if (tokens.refreshToken) {
      await this.adapter.refreshTokens.create({
        user_id: user.id,
        session_id: session?.id,
        token_hash: this.tokenService.hashToken(tokens.refreshToken),
        expires_at: this.tokenService.getRefreshTokenExpiresAt(),
      });
    }

    return {
      message: 'Registration successful',
      tokens,
      user: this.sanitizeUser(user, roles.map((r) => r.name), permissions.map((p) => p.name)),
    };
  }

  /**
   * Log in user
   */
  async login(
    dto: LoginDto,
    req?: { ip?: string; headers?: Record<string, any> },
  ): Promise<LoginResult> {
    const user = await this.adapter.users.findByEmail(dto.email.toLowerCase().trim());
    if (!user) {
      await this.handleFailedLogin(dto.email, 'User not found', req);
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.is_active || user.deleted_at) {
      await this.handleFailedLogin(dto.email, 'Account inactive or deleted', req);
      throw new UnauthorizedException('Account is inactive or disabled');
    }

    const isPasswordValid = await this.passwordService.compare(dto.password, user.password_hash);
    if (!isPasswordValid) {
      await this.handleFailedLogin(dto.email, 'Invalid password', req);
      throw new UnauthorizedException('Invalid email or password');
    }

    if (this.options.features?.emailVerification && !user.is_email_verified) {
      throw new UnauthorizedException('Please verify your email address before logging in');
    }

    // 2FA Verification check
    if (user.two_factor_enabled && user.two_factor_secret) {
      if (!dto.twoFactorCode) {
        // Return 2FA challenge
        const twoFactorToken = this.tokenService.sign(
          { sub: user.id, email: user.email, is2FAChallenge: true },
          300, // 5 minutes validity
        );
        return {
          requiresTwoFactor: true,
          twoFactorToken,
        };
      }

      // Verify code (either TOTP 6-digit or recovery code)
      const isValidTotp = this.twoFactorService.verifyToken(user.two_factor_secret, dto.twoFactorCode);
      let isValidRecovery = false;

      if (!isValidTotp && user.two_factor_recovery_codes && user.two_factor_recovery_codes.length > 0) {
        const recoveryResult = this.twoFactorService.verifyRecoveryCode(
          dto.twoFactorCode,
          user.two_factor_recovery_codes,
        );
        if (recoveryResult.isValid) {
          isValidRecovery = true;
          await this.adapter.users.update(user.id, {
            two_factor_recovery_codes: recoveryResult.remainingHashedCodes,
          });
        }
      }

      if (!isValidTotp && !isValidRecovery) {
        throw new UnauthorizedException('Invalid two-factor authentication code');
      }
    }

    let session;
    if (this.options.sessions?.enabled) {
      session = await this.sessionService.createSession(user.id, req);
    }

    const roles = await this.adapter.users.getUserRoles(user.id);
    const permissions = await this.adapter.users.getUserPermissions(user.id);

    const tokens = this.tokenService.createTokenPair({
      sub: user.id,
      email: user.email,
      roles: roles.map((r) => r.name),
      permissions: permissions.map((p) => p.name),
      sessionId: session?.id,
    });

    if (tokens.refreshToken) {
      await this.adapter.refreshTokens.create({
        user_id: user.id,
        session_id: session?.id,
        token_hash: this.tokenService.hashToken(tokens.refreshToken),
        expires_at: this.tokenService.getRefreshTokenExpiresAt(),
      });
    }

    await this.auditService.log({
      user_id: user.id,
      action: 'LOGIN',
      entity: 'USER',
      entity_id: user.id,
      ip: req?.ip,
      user_agent: req?.headers?.['user-agent'],
      metadata: { sessionId: session?.id },
    });

    this.emitEvent('auth.login', new UserLoggedInEvent(user, session, req?.ip, req?.headers?.['user-agent']));

    return {
      tokens,
      user: this.sanitizeUser(user, roles.map((r) => r.name), permissions.map((p) => p.name)),
    };
  }

  /**
   * Refresh tokens with rotation and revocation reuse detection
   */
  async refresh(
    rawRefreshToken: string,
    req?: { ip?: string; headers?: Record<string, any> },
  ): Promise<TokenPair> {
    const tokenHash = this.tokenService.hashToken(rawRefreshToken);
    const existingToken = await this.adapter.refreshTokens.findByTokenHash(tokenHash);

    if (!existingToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (existingToken.is_revoked) {
      // Possible token reuse attack! Invalidate all refresh tokens for this user
      await this.adapter.refreshTokens.revokeAllForUser(existingToken.user_id);
      throw new UnauthorizedException('Revoked token detected. All sessions invalidated for security.');
    }

    if (new Date(existingToken.expires_at) < new Date()) {
      await this.adapter.refreshTokens.revoke(existingToken.id);
      throw new UnauthorizedException('Refresh token has expired');
    }

    const user = await this.adapter.users.findById(existingToken.user_id);
    if (!user || !user.is_active || user.deleted_at) {
      throw new UnauthorizedException('User account no longer active');
    }

    const roles = await this.adapter.users.getUserRoles(user.id);
    const permissions = await this.adapter.users.getUserPermissions(user.id);

    // Create new token pair
    const newTokens = this.tokenService.createTokenPair({
      sub: user.id,
      email: user.email,
      roles: roles.map((r) => r.name),
      permissions: permissions.map((p) => p.name),
      sessionId: existingToken.session_id || undefined,
    });

    const newHash = newTokens.refreshToken ? this.tokenService.hashToken(newTokens.refreshToken) : undefined;

    // Revoke old token and link to replacement hash
    await this.adapter.refreshTokens.revoke(existingToken.id, newHash);

    // Save new refresh token
    if (newHash && newTokens.refreshToken) {
      await this.adapter.refreshTokens.create({
        user_id: user.id,
        session_id: existingToken.session_id,
        token_hash: newHash,
        expires_at: this.tokenService.getRefreshTokenExpiresAt(),
      });
    }

    return newTokens;
  }

  /**
   * Logout user
   */
  async logout(
    userId: string,
    sessionId?: string,
    refreshToken?: string,
  ): Promise<{ message: string }> {
    if (sessionId) {
      await this.adapter.sessions.revoke(sessionId);
    }
    if (refreshToken) {
      const hash = this.tokenService.hashToken(refreshToken);
      const token = await this.adapter.refreshTokens.findByTokenHash(hash);
      if (token) {
        await this.adapter.refreshTokens.revoke(token.id);
      }
    }

    await this.auditService.log({
      user_id: userId,
      action: 'LOGOUT',
      entity: 'USER',
      entity_id: userId,
      metadata: { sessionId },
    });

    this.emitEvent('auth.logout', new UserLoggedOutEvent(userId, sessionId));

    return { message: 'Logged out successfully' };
  }

  /**
   * Forgot password request
   */
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.adapter.users.findByEmail(dto.email.toLowerCase().trim());
    if (!user) {
      // Don't leak user existence
      return { message: 'If an account exists with this email, instructions have been sent.' };
    }

    await this.adapter.passwordResets.invalidateExistingForUser(user.id);

    const token = this.passwordService.generateRandomToken(32);
    const tokenHash = this.passwordService.hashToken(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.adapter.passwordResets.create({
      user_id: user.id,
      token_hash: tokenHash,
      expires_at: expiresAt,
    });

    await this.mailService.sendPasswordResetEmail(user.email, token);

    this.emitEvent('auth.passwordResetRequested', new PasswordResetRequestedEvent(user, token));

    return { message: 'If an account exists with this email, instructions have been sent.' };
  }

  /**
   * Reset password with token
   */
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const tokenHash = this.passwordService.hashToken(dto.token);
    const resetRecord = await this.adapter.passwordResets.findValidByTokenHash(tokenHash);

    if (!resetRecord) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    const user = await this.adapter.users.findById(resetRecord.user_id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const newHash = await this.passwordService.hash(dto.newPassword);
    await this.adapter.users.update(user.id, { password_hash: newHash });

    await this.adapter.passwordResets.markAsUsed(resetRecord.id);

    // Invalidate all active sessions & refresh tokens after password change
    await this.sessionService.revokeAllSessions(user.id);
    await this.adapter.refreshTokens.revokeAllForUser(user.id);

    await this.auditService.log({
      user_id: user.id,
      action: 'PASSWORD_RESET',
      entity: 'USER',
      entity_id: user.id,
    });

    this.emitEvent('auth.passwordReset', new PasswordResetEvent(user));

    return { message: 'Password has been successfully reset. Please log in with your new password.' };
  }

  /**
   * Verify email
   */
  async verifyEmail(dto: VerifyEmailDto): Promise<{ message: string }> {
    const tokenHash = this.passwordService.hashToken(dto.token);
    const verificationRecord = await this.adapter.emailVerifications.findValidByTokenHash(tokenHash);

    if (!verificationRecord) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    const user = await this.adapter.users.findById(verificationRecord.user_id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.adapter.users.update(user.id, { is_email_verified: true });
    await this.adapter.emailVerifications.markAsUsed(verificationRecord.id);

    await this.auditService.log({
      user_id: user.id,
      action: 'EMAIL_VERIFIED',
      entity: 'USER',
      entity_id: user.id,
    });

    this.emitEvent('auth.emailVerified', new EmailVerifiedEvent(user));

    return { message: 'Email verified successfully.' };
  }

  /**
   * Setup 2FA secret
   */
  async generateTwoFactorSecret(
    userId: string,
    issuerName = 'NestAuth',
  ): Promise<{ secret: string; otpAuthUrl: string; recoveryCodes: string[] }> {
    const user = await this.adapter.users.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const secret = this.twoFactorService.generateSecret();
    const otpAuthUrl = this.twoFactorService.generateOtpAuthUrl({
      accountName: user.email,
      issuer: issuerName,
      secret,
    });

    const { rawCodes, hashedCodes } = this.twoFactorService.generateRecoveryCodes();

    // Store pending secret temporarily in metadata until confirmed
    await this.adapter.users.update(user.id, {
      metadata: {
        ...(user.metadata || {}),
        pending_2fa_secret: secret,
        pending_2fa_recovery_codes: hashedCodes,
      },
    });

    return {
      secret,
      otpAuthUrl,
      recoveryCodes: rawCodes,
    };
  }

  /**
   * Confirm and enable 2FA
   */
  async enableTwoFactor(userId: string, code: string): Promise<{ message: string }> {
    const user = await this.adapter.users.findById(userId);
    if (!user || !user.metadata?.pending_2fa_secret) {
      throw new BadRequestException('No pending 2FA setup found. Please request setup first.');
    }

    const secret = user.metadata.pending_2fa_secret;
    const isValid = this.twoFactorService.verifyToken(secret, code);

    if (!isValid) {
      throw new BadRequestException('Invalid two-factor authentication code');
    }

    const recoveryCodes = user.metadata.pending_2fa_recovery_codes || [];
    const newMetadata = { ...user.metadata };
    delete newMetadata.pending_2fa_secret;
    delete newMetadata.pending_2fa_recovery_codes;

    await this.adapter.users.update(user.id, {
      two_factor_enabled: true,
      two_factor_secret: secret,
      two_factor_recovery_codes: recoveryCodes,
      metadata: newMetadata,
    });

    await this.auditService.log({
      user_id: user.id,
      action: '2FA_ENABLED',
      entity: 'USER',
      entity_id: user.id,
    });

    return { message: 'Two-factor authentication has been enabled successfully' };
  }

  /**
   * Disable 2FA
   */
  async disableTwoFactor(userId: string, code: string): Promise<{ message: string }> {
    const user = await this.adapter.users.findById(userId);
    if (!user || !user.two_factor_enabled || !user.two_factor_secret) {
      throw new BadRequestException('Two-factor authentication is not enabled');
    }

    const isValid = this.twoFactorService.verifyToken(user.two_factor_secret, code);
    if (!isValid) {
      throw new BadRequestException('Invalid two-factor authentication code');
    }

    await this.adapter.users.update(user.id, {
      two_factor_enabled: false,
      two_factor_secret: null,
      two_factor_recovery_codes: null,
    });

    await this.auditService.log({
      user_id: user.id,
      action: '2FA_DISABLED',
      entity: 'USER',
      entity_id: user.id,
    });

    return { message: 'Two-factor authentication has been disabled successfully' };
  }

  private async handleFailedLogin(
    email: string,
    reason: string,
    req?: { ip?: string; headers?: Record<string, any> },
  ) {
    await this.auditService.log({
      action: 'LOGIN_FAILED',
      entity: 'USER',
      ip: req?.ip,
      user_agent: req?.headers?.['user-agent'],
      metadata: { email, reason },
    });
    this.emitEvent('auth.loginFailed', new UserLoginFailedEvent(email, reason, req?.ip, req?.headers?.['user-agent']));
  }

  private emitEvent(eventName: string, payload: any) {
    if (this.eventEmitter) {
      this.eventEmitter.emit(eventName, payload);
    }
  }

  private sanitizeUser(user: any, roles?: string[], permissions?: string[]) {
    const sanitized = { ...user };
    delete sanitized.password_hash;
    delete sanitized.two_factor_secret;
    delete sanitized.two_factor_recovery_codes;
    if (roles) sanitized.roles = roles;
    if (permissions) sanitized.permissions = permissions;
    return sanitized;
  }
}
