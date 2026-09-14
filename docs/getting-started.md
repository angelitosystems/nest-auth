# Getting Started with `@angelitosystems/nest-auth`

`@angelitosystems/nest-auth` is an enterprise-grade, modular authentication, authorization, role/permission, session, audit, and persistence ecosystem for NestJS applications.

---

## Quick Start via CLI

The fastest and recommended way to set up your NestJS application is with the `nest-auth-kit` interactive CLI.

In your NestJS project directory, run:

```bash
npx nest-auth-kit init
```

The interactive wizard will guide you through:
1. **Target Database**: PostgreSQL, MySQL, or MongoDB
2. **ORM / ODM Adapter**:
   - PostgreSQL: Prisma or TypeORM
   - MySQL: TypeORM or Sequelize
   - MongoDB: Mongoose
3. **Authentication Mechanism**: JWT (Bearer), httpOnly Cookies, or Hybrid (JWT + Cookies)
4. **Security Features**:
   - Refresh Tokens with automatic rotation and reuse attack detection
   - Email verification with configurable expiration
   - Password reset with timing-safe single-use token hashing
   - Two-Factor Authentication (2FA TOTP + hashed recovery codes)
   - Role-Based Access Control (RBAC) with `@Roles()` and `RolesGuard`
   - Granular Permissions with wildcards (`users.*`, `*`) and `PermissionsGuard`
   - Automated Audit Logging with `@Audited()` and database audit trail
5. **Database Migrations & Seed Generation**

---

## Manual Installation

If you prefer to configure manually:

### 1. Install Core and Chosen Adapter

```bash
# Core package
npm install @angelitosystems/nest-auth

# For PostgreSQL with Prisma:
npm install @angelitosystems/nest-auth-prisma @prisma/client

# For PostgreSQL or MySQL with TypeORM:
npm install @angelitosystems/nest-auth-typeorm typeorm

# For MySQL or PostgreSQL with Sequelize:
npm install @angelitosystems/nest-auth-sequelize sequelize sequelize-typescript

# For MongoDB with Mongoose:
npm install @angelitosystems/nest-auth-mongoose mongoose
```

### 2. Configure Environment Variables (`.env`)

```env
AUTH_JWT_SECRET=your-secure-random-32-byte-hex-string
AUTH_ACCESS_TOKEN_EXPIRES_IN=15m
AUTH_REFRESH_TOKEN_EXPIRES_IN=7d
AUTH_COOKIE_ENABLED=false
AUTH_COOKIE_NAME=access_token
AUTH_SESSIONS_ENABLED=true

AUTH_SEED_ADMIN_EMAIL=admin@example.com
AUTH_SEED_ADMIN_PASSWORD=YourStrongPassword123!
```

### 3. Import `AuthModule` in NestJS

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
      cookies: {
        enabled: false,
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
      globalGuard: true, // Protects all routes by default!
    }),
  ],
})
export class AppModule {}
```

---

## Route Protection & Decorators

### Protect Routes with Global Guard

When `globalGuard: true` is enabled, all routes require a valid JWT or cookie token by default.

To mark a route as public:

```typescript
import { Controller, Get } from '@nestjs/common';
import { Public } from '@angelitosystems/nest-auth';

@Controller('public')
export class PublicController {
  @Public()
  @Get('health')
  healthCheck() {
    return { status: 'ok' };
  }
}
```

### Extract Current User

```typescript
import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from '@angelitosystems/nest-auth';

@Controller('profile')
export class ProfileController {
  @Get('me')
  getProfile(@CurrentUser() user: any) {
    return user;
  }

  @Get('email')
  getEmail(@CurrentUser('email') email: string) {
    return { email };
  }
}
```

### Enforce Roles

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles, RolesGuard, RolesMode } from '@angelitosystems/nest-auth';

@Controller('admin')
@UseGuards(RolesGuard)
export class AdminController {
  // Access allowed if user has 'admin' OR 'superadmin'
  @Roles('admin', 'superadmin')
  @Get('dashboard')
  getDashboard() {
    return { stats: 'secret' };
  }

  // Access requires BOTH 'admin' AND 'billing'
  @Roles('admin', 'billing')
  @RolesMode('AND')
  @Get('finances')
  getFinances() {
    return { invoices: [] };
  }
}
```

### Enforce Permissions & Wildcards

```typescript
import { Controller, Delete, Post, UseGuards } from '@nestjs/common';
import { Permissions, PermissionsGuard } from '@angelitosystems/nest-auth';

@Controller('users')
@UseGuards(PermissionsGuard)
export class UserController {
  // Matches exact 'users.delete', prefix wildcard 'users.*', or superuser '*'
  @Permissions('users.delete')
  @Delete(':id')
  deleteUser() {
    return { deleted: true };
  }

  @Permissions('users.create')
  @Post()
  createUser() {
    return { created: true };
  }
}
```

### Automated Audit Logging

```typescript
import { Controller, Post, Body, UseInterceptors } from '@nestjs/common';
import { Audited, AuditInterceptor } from '@angelitosystems/nest-auth';

@Controller('orders')
@UseInterceptors(AuditInterceptor)
export class OrderController {
  @Audited({ action: 'CREATE_ORDER', entity: 'ORDER' })
  @Post()
  createOrder(@Body() dto: any) {
    return { id: 'order-123', status: 'created' };
  }
}
```
