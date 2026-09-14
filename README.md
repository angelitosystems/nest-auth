<div align="center">

# @angelitosystems/nest-auth

### Enterprise Authentication & Authorization Ecosystem for NestJS

[![Built by Angelito Systems](https://img.shields.io/badge/Built%20by-Angelito%20Systems-00C4CC?style=for-the-badge&logo=shield&logoColor=white)](https://angelitosystems.com)
[![NestJS](https://img.shields.io/badge/NestJS-v10%20%7C%20v11-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x%20Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)
[![CI](https://img.shields.io/badge/CI-Passing-brightgreen?style=for-the-badge&logo=githubactions&logoColor=white)]()

<p align="center">
  A modular, enterprise-grade authentication, authorization, role/permission, session, audit, and persistence suite designed for production NestJS services.
</p>

[**Explore Documentation**](https://angelitosystems.github.io/nest-auth) · [**Report Issue**](https://github.com/AngelitoSystems/nest-auth/issues) · [**Request Feature**](https://github.com/AngelitoSystems/nest-auth/issues)

</div>

---

```text
┌─ Terminal ───────────────────────────────────────────────┐
│                                                          │
│ $ npx nest-auth-kit init                                 │
│                                                          │
│ ✔ NestJS detected                                        │
│ ✔ TypeScript detected                                    │
│                                                          │
│ ? Select your database                                   │
│   ❯ PostgreSQL                                           │
│     MySQL                                                │
│     MongoDB                                              │
│                                                          │
│ ? Select ORM / ODM adapter                               │
│   ❯ Prisma                                               │
│     TypeORM                                              │
│                                                          │
│ ╭──────────────────────────────────────────╮             │
│ │ Installation completed successfully      │             │
│ ╰──────────────────────────────────────────╯             │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## ⚡ Quick Start

Bootstrap your entire authentication and authorization architecture with the official interactive CLI:

```bash
npx nest-auth-kit init
```

The wizard automatically detects your existing NestJS project, tsconfig, ORM, and environment variables, generating all necessary modules, entities, and configuration files.

---

## 📦 Database & ORM Support Matrix

`@angelitosystems/nest-auth` decouples authentication logic from persistence via the **Adapter Pattern**. Install only the adapter needed for your database:

| Database | ORM / ODM | Adapter Package | Capabilities |
| :--- | :--- | :--- | :--- |
| **PostgreSQL** | **Prisma** | `@angelitosystems/nest-auth-prisma` | Full RBAC, Multi-device Sessions, 2FA, Audit Trail, Migrations |
| **PostgreSQL** | **TypeORM** | `@angelitosystems/nest-auth-typeorm` | Full RBAC, Multi-device Sessions, 2FA, Audit Trail, Migrations |
| **MySQL** | **TypeORM** | `@angelitosystems/nest-auth-typeorm` | Full RBAC, Multi-device Sessions, 2FA, Audit Trail, Migrations |
| **MySQL** | **Sequelize** | `@angelitosystems/nest-auth-sequelize` | Full RBAC, Multi-device Sessions, 2FA, Audit Trail, Migrations |
| **MongoDB** | **Mongoose** | `@angelitosystems/nest-auth-mongoose` | Full RBAC, Multi-device Sessions, 2FA, Audit Trail, Auto-indexes |

---

## 🛡 Key Features

- **🔐 Dual Token Strategies**: JWT Bearer headers, secure `httpOnly` cookies, or seamless hybrid support.
- **🔄 Refresh Token Rotation & Attack Detection**: All refresh tokens are hashed (SHA-256) in the database. If a revoked token is presented, the system detects a token reuse attack and immediately invalidates all user sessions.
- **👮 RBAC & Wildcard Permissions**:
  - `@Roles('admin', 'editor')` with `OR` or `AND` evaluation modes.
  - `@Permissions('users.read', 'users.create')` with wildcard pattern matching (`users.*`, `*`).
- **📱 Multi-Device Sessions**: Tracks client IP, device, User-Agent, and last activity timestamp. Supports concurrent session limits and remote revocation.
- **🔑 Password Security**: 100,000-iteration PBKDF2 (SHA-512) hashing with cryptographic salts and constant-time comparisons (`crypto.timingSafeEqual`).
- **🕒 Two-Factor Authentication (2FA)**: RFC 6238 compliant TOTP engine with QR code generation and 8 single-use hashed recovery codes.
- **📋 Automated Audit Trail**: `@Audited()` decorator and `AuditInterceptor` capture mutated entities, pre/post changes (`old_values`, `new_values`), IP, route, and metadata.
- **📧 Password Reset & Email Verification**: Single-use hashed tokens with expiration and pluggable `MailProvider` interface (SMTP, Resend, SendGrid, SES, Console).
- **🩺 Project Doctor**: `npx nest-auth-kit doctor` diagnoses environment variables, versions, ORM setups, and security secrets.

---

## 💻 Code Example

### Module Setup

```typescript
import { Module } from '@nestjs/common';
import { AuthModule } from '@angelitosystems/nest-auth';
import { PrismaAuthAdapter } from '@angelitosystems/nest-auth-prisma';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const adapter = new PrismaAuthAdapter(prisma);

@Module({
  imports: [
    AuthModule.forRoot({
      jwt: {
        secret: process.env.AUTH_JWT_SECRET!,
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
      globalGuard: true, // Protect all endpoints by default
    }),
  ],
})
export class AppModule {}
```

### Route Protection & Decorators

```typescript
import { Controller, Get, Delete, Param, UseGuards } from '@nestjs/common';
import {
  CurrentUser,
  Public,
  Roles,
  RolesGuard,
  Permissions,
  PermissionsGuard,
  Audited,
} from '@angelitosystems/nest-auth';

@Controller('users')
export class UsersController {
  // Public endpoint exempt from authentication
  @Public()
  @Get('health')
  health() {
    return { status: 'healthy' };
  }

  // Injects authenticated user profile
  @Get('me')
  getProfile(@CurrentUser() user: any) {
    return user;
  }

  // Requires 'admin' role
  @Roles('admin')
  @UseGuards(RolesGuard)
  @Get('metrics')
  getMetrics() {
    return { activeUsers: 4200 };
  }

  // Requires 'users.delete' permission (matches 'users.*' or '*')
  @Permissions('users.delete')
  @UseGuards(PermissionsGuard)
  @Audited({ action: 'DELETE_USER', entity: 'USER' })
  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return { message: 'User deleted' };
  }
}
```

---

## 🛠 CLI Commands

```bash
# Initialize auth setup wizard
npx nest-auth-kit init

# Check environment & secrets
npx nest-auth-kit doctor

# Execute or create database migrations
npx nest-auth-kit migrate
npx nest-auth-kit migrate create AddProfileFields

# Seed initial admin & default roles
npx nest-auth-kit seed

# Generate custom auth components
npx nest-auth-kit generate guard Subscription
npx nest-auth-kit generate controller Account

# Display version and environment information
npx nest-auth-kit info
npx nest-auth-kit --version
```

---

## 🐳 Docker Support

Start local development databases (PostgreSQL, MySQL, MongoDB) with a single command:

```bash
docker compose up -d
```

---

## 📄 License

MIT © [Angelito Systems](LICENSE)
