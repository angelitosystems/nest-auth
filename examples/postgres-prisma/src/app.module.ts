import { Module } from '@nestjs/common';
import { AuthModule } from '@angelitosystems/nest-auth';
import { PrismaAuthAdapter } from '@angelitosystems/nest-auth-prisma';
import { PrismaClient } from '@prisma/client';
import { UsersController } from './users.controller';

const prisma = new PrismaClient();
const adapter = new PrismaAuthAdapter(prisma);

@Module({
  imports: [
    AuthModule.forRoot({
      jwt: {
        secret: process.env.AUTH_JWT_SECRET || 'dev-secret-super-secure-at-least-32-chars',
        accessTokenExpiresIn: '15m',
        refreshTokenExpiresIn: '7d',
      },
      sessions: {
        enabled: true,
        maxConcurrentSessions: 5,
      },
      features: {
        refreshTokens: true,
        emailVerification: true,
        passwordReset: true,
        twoFactor: true,
        roles: true,
        permissions: true,
        auditLogs: true,
      },
      adapter,
      globalGuard: true,
    }),
  ],
  controllers: [UsersController],
})
export class AppModule {}
