# @angelitosystems/nest-auth

[![npm version](https://img.shields.io/npm/v/@angelitosystems/nest-auth.svg?color=06b6d4)](https://www.npmjs.com/package/@angelitosystems/nest-auth)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built by Angelito Systems](https://img.shields.io/badge/Built%20by-Angelito%20Systems-6366f1.svg)](https://angelitosystems.com)

Enterprise-grade, modular authentication, authorization, RBAC, sessions, 2FA, and audit ecosystem for NestJS applications.

---

## ⚡ Quick Start

### Installation

```bash
# Recommended: initialize via interactive CLI toolkit
npx nest-auth-kit init

# Or install manually
npm install @angelitosystems/nest-auth
```

### Module Registration

```typescript
import { Module } from '@nestjs/common';
import { AuthModule } from '@angelitosystems/nest-auth';
import { PrismaAuthAdapter } from '@angelitosystems/nest-auth-prisma';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Module({
  imports: [
    AuthModule.forRoot({
      adapter: new PrismaAuthAdapter(prisma),
      jwt: {
        secret: process.env.AUTH_JWT_SECRET || 'super-secret-key-min-32-chars-long!',
        expiresIn: '15m',
        refreshExpiresIn: '7d',
      },
      twoFactor: {
        enabled: true,
        appName: 'My Enterprise App',
      },
      session: {
        maxConcurrent: 5,
      },
      audit: {
        enabled: true,
      },
    }),
  ],
})
export class AppModule {}
```

---

## 🔐 Key Features

- **Decoupled Architecture**: Persistence-agnostic core supporting Prisma, TypeORM, Sequelize, and Mongoose adapters.
- **Timing-Safe Cryptography**: PBKDF2 with 100,000 iterations & SHA-512 for password hashing, timing-safe verification.
- **Token Lifecycle**: Short-lived JWT access tokens, automatic refresh rotation, and token reuse attack detection.
- **Granular RBAC**: Decorators `@Roles()`, `@Permissions()` with wildcard matching (`users.*`, `*`), and `@CurrentUser()`.
- **Two-Factor Authentication**: RFC 6238 TOTP with QR URI generation and single-use hashed recovery codes.
- **Multi-Device Sessions**: Device fingerprinting, IP & User-Agent tracking, concurrent session caps, and instant revocation.
- **Audit Logging**: Decorator `@Audited()` & `AuditInterceptor` tracking actor, action, route, and state changes.

---

## 📦 Database Adapters

- [`@angelitosystems/nest-auth-prisma`](https://www.npmjs.com/package/@angelitosystems/nest-auth-prisma)
- [`@angelitosystems/nest-auth-typeorm`](https://www.npmjs.com/package/@angelitosystems/nest-auth-typeorm)
- [`@angelitosystems/nest-auth-sequelize`](https://www.npmjs.com/package/@angelitosystems/nest-auth-sequelize)
- [`@angelitosystems/nest-auth-mongoose`](https://www.npmjs.com/package/@angelitosystems/nest-auth-mongoose)

---

## 📄 License

MIT © [Angelito Systems](https://angelitosystems.com)
