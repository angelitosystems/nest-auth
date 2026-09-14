import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { AUTH_MODULE_OPTIONS, DEFAULT_ACCESS_TOKEN_EXPIRES_IN, DEFAULT_REFRESH_TOKEN_EXPIRES_IN } from '../constants/auth.constants';
import { AuthModuleOptions } from '../interfaces/auth-module-options.interface';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  roles?: string[];
  permissions?: string[];
  sessionId?: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
  [key: string]: any;
}

export interface TokenPair {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number; // seconds until access token expires
}

@Injectable()
export class TokenService {
  constructor(
    @Inject(AUTH_MODULE_OPTIONS)
    private readonly options: AuthModuleOptions,
  ) {}

  /**
   * Parses time string (e.g., '15m', '7d', '1h', '30s') or seconds into seconds
   */
  parseDuration(duration: string | number | undefined, defaultDuration: string): number {
    const val = duration || defaultDuration;
    if (typeof val === 'number') return val;

    const match = val.match(/^(\d+)([smhd])$/);
    if (!match) {
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? 900 : parsed;
    }

    const count = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
      case 's': return count;
      case 'm': return count * 60;
      case 'h': return count * 3600;
      case 'd': return count * 86400;
      default: return 900;
    }
  }

  /**
   * Signs a JWT using HMAC-SHA256
   */
  sign(payload: Record<string, any>, expiresInSeconds: number): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const now = Math.floor(Date.now() / 1000);
    const exp = now + expiresInSeconds;

    const fullPayload: JwtPayload = {
      ...payload,
      iat: now,
      exp,
      sub: payload.sub,
      email: payload.email,
    };

    if (this.options.jwt.issuer) {
      fullPayload.iss = this.options.jwt.issuer;
    }
    if (this.options.jwt.audience) {
      fullPayload.aud = this.options.jwt.audience;
    }

    const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
    const base64Payload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');

    const signature = crypto
      .createHmac('sha256', this.options.jwt.secret)
      .update(`${base64Header}.${base64Payload}`)
      .digest('base64url');

    return `${base64Header}.${base64Payload}.${signature}`;
  }

  /**
   * Verifies and decodes a JWT
   */
  verify(token: string): JwtPayload {
    if (!token) {
      throw new UnauthorizedException('Token is missing');
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new UnauthorizedException('Invalid token structure');
    }

    const [base64Header, base64Payload, signature] = parts;

    const expectedSignature = crypto
      .createHmac('sha256', this.options.jwt.secret)
      .update(`${base64Header}.${base64Payload}`)
      .digest('base64url');

    const sigBuf = Buffer.from(signature);
    const expSigBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expSigBuf.length || !crypto.timingSafeEqual(sigBuf, expSigBuf)) {
      throw new UnauthorizedException('Invalid token signature');
    }

    let payload: JwtPayload;
    try {
      payload = JSON.parse(Buffer.from(base64Payload, 'base64url').toString('utf8'));
    } catch {
      throw new UnauthorizedException('Invalid token payload');
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new UnauthorizedException('Token has expired');
    }

    if (this.options.jwt.issuer && payload.iss && payload.iss !== this.options.jwt.issuer) {
      throw new UnauthorizedException('Invalid token issuer');
    }

    if (this.options.jwt.audience && payload.aud && payload.aud !== this.options.jwt.audience) {
      throw new UnauthorizedException('Invalid token audience');
    }

    return payload;
  }

  /**
   * Generates a pair of access and refresh tokens
   */
  createTokenPair(
    payload: { sub: string; email: string; roles?: string[]; permissions?: string[]; sessionId?: string },
    generateRefreshToken = true,
  ): TokenPair {
    const accessExpiresIn = this.parseDuration(
      this.options.jwt.accessTokenExpiresIn,
      DEFAULT_ACCESS_TOKEN_EXPIRES_IN,
    );

    const accessToken = this.sign(payload, accessExpiresIn);

    let refreshToken: string | undefined;
    if (generateRefreshToken && this.options.features?.refreshTokens !== false) {
      refreshToken = crypto.randomBytes(40).toString('hex');
    }

    return {
      accessToken,
      refreshToken,
      expiresIn: accessExpiresIn,
    };
  }

  /**
   * Computes SHA-256 hash of a refresh token for safe storage
   */
  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Computes refresh token expiration date
   */
  getRefreshTokenExpiresAt(): Date {
    const refreshExpiresIn = this.parseDuration(
      this.options.jwt.refreshTokenExpiresIn,
      DEFAULT_REFRESH_TOKEN_EXPIRES_IN,
    );
    return new Date(Date.now() + refreshExpiresIn * 1000);
  }
}
