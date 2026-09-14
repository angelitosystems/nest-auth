import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { AUTH_DATABASE_ADAPTER, AUTH_MODULE_OPTIONS } from '../constants/auth.constants';
import { AuthDatabaseAdapter } from '../interfaces/database-adapter.interface';
import { AuthModuleOptions } from '../interfaces/auth-module-options.interface';
import { Session } from '../interfaces/models.interface';

@Injectable()
export class SessionService {
  constructor(
    @Inject(AUTH_DATABASE_ADAPTER)
    private readonly adapter: AuthDatabaseAdapter,
    @Inject(AUTH_MODULE_OPTIONS)
    private readonly options: AuthModuleOptions,
  ) {}

  async createSession(
    userId: string,
    req?: { ip?: string; headers?: Record<string, any> },
  ): Promise<Session> {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const ip = req?.ip || req?.headers?.['x-forwarded-for'] || null;
    const userAgent = req?.headers?.['user-agent'] || null;
    const device = this.parseDevice(userAgent);

    // Default session validity 30 days
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Check concurrent sessions limit if configured
    const maxSessions = this.options.sessions?.maxConcurrentSessions;
    if (maxSessions && maxSessions > 0) {
      const activeSessions = await this.adapter.sessions.findActiveByUserId(userId);
      if (activeSessions.length >= maxSessions) {
        // Revoke the oldest session
        const sorted = activeSessions.sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );
        const toRevokeCount = activeSessions.length - maxSessions + 1;
        for (let i = 0; i < toRevokeCount; i++) {
          await this.adapter.sessions.revoke(sorted[i].id);
        }
      }
    }

    return this.adapter.sessions.create({
      user_id: userId,
      token_hash: tokenHash,
      ip_address: typeof ip === 'string' ? ip : null,
      user_agent: typeof userAgent === 'string' ? userAgent : null,
      device,
      expires_at: expiresAt,
    });
  }

  async getUserSessions(userId: string): Promise<Session[]> {
    return this.adapter.sessions.findActiveByUserId(userId);
  }

  async revokeSession(userId: string, sessionId: string): Promise<void> {
    const session = await this.adapter.sessions.findById(sessionId);
    if (!session || session.user_id !== userId) {
      throw new NotFoundException('Session not found or not owned by user');
    }
    await this.adapter.sessions.revoke(sessionId);
  }

  async revokeAllSessions(userId: string, exceptSessionId?: string): Promise<void> {
    await this.adapter.sessions.revokeAllForUser(userId, exceptSessionId);
  }

  private parseDevice(userAgent?: string | null): string {
    if (!userAgent) return 'Unknown Device';
    if (/mobile/i.test(userAgent)) return 'Mobile';
    if (/tablet/i.test(userAgent)) return 'Tablet';
    if (/iPad|Android|Touch/i.test(userAgent)) return 'Mobile/Tablet';
    if (/Macintosh|Mac OS/i.test(userAgent)) return 'macOS';
    if (/Windows/i.test(userAgent)) return 'Windows PC';
    if (/Linux/i.test(userAgent)) return 'Linux PC';
    return 'Desktop';
  }
}
