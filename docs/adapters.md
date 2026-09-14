# Database Adapters Guide

`@angelitosystems/nest-auth` implements the **Adapter Pattern** with strict dependency inversion. The Core package defines abstract repositories and interfaces (`AuthDatabaseAdapter`, `IUserRepository`, `ISessionRepository`, etc.) without being coupled to any specific ORM or database.

---

## Supported Database & ORM Matrix

| Database   | ORM / ODM  | Adapter Package                      | Supported Features |
| :--------- | :--------- | :----------------------------------- | :----------------- |
| PostgreSQL | Prisma     | `@angelitosystems/nest-auth-prisma`  | Full RBAC, Sessions, 2FA, Audit, Migrations |
| PostgreSQL | TypeORM    | `@angelitosystems/nest-auth-typeorm` | Full RBAC, Sessions, 2FA, Audit, Migrations |
| MySQL      | TypeORM    | `@angelitosystems/nest-auth-typeorm` | Full RBAC, Sessions, 2FA, Audit, Migrations |
| MySQL      | Sequelize  | `@angelitosystems/nest-auth-sequelize` | Full RBAC, Sessions, 2FA, Audit, Migrations |
| MongoDB    | Mongoose   | `@angelitosystems/nest-auth-mongoose`| Full RBAC, Sessions, 2FA, Audit, Auto-indexes |

---

## 1. Prisma Adapter (`@angelitosystems/nest-auth-prisma`)

### Installation
```bash
npm install @angelitosystems/nest-auth @angelitosystems/nest-auth-prisma @prisma/client
npm install -D prisma
```

### Schema Setup
The adapter provides a complete schema template with models:
`User`, `Role`, `Permission`, `UserRole`, `RolePermission`, `Session`, `RefreshToken`, `PasswordReset`, `EmailVerification`, `AuditLog`.

Run:
```bash
npx nest-auth-kit init
# Or copy schema from @angelitosystems/nest-auth-prisma/prisma/schema.prisma
npx prisma migrate dev --name init_auth
```

### NestJS Integration
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
      jwt: { secret: process.env.AUTH_JWT_SECRET! },
      adapter,
      globalGuard: true,
    }),
  ],
})
export class AppModule {}
```

---

## 2. TypeORM Adapter (`@angelitosystems/nest-auth-typeorm`)

### Installation
```bash
npm install @angelitosystems/nest-auth @angelitosystems/nest-auth-typeorm typeorm pg
# For MySQL: npm install mysql2 instead of pg
```

### Entities
The package exports all entities ready to be registered in your TypeORM configuration:
```typescript
import { AUTH_ENTITIES, TypeOrmAuthAdapter } from '@angelitosystems/nest-auth-typeorm';
import { DataSource } from 'typeorm';

export const appDataSource = new DataSource({
  type: 'postgres', // or 'mysql'
  url: process.env.DATABASE_URL,
  entities: [...AUTH_ENTITIES, /* your other entities */],
  synchronize: false, // use migrations in production
});
```

### Adapter Initialization
```typescript
const adapter = new TypeOrmAuthAdapter(appDataSource);

AuthModule.forRoot({
  jwt: { secret: process.env.AUTH_JWT_SECRET! },
  adapter,
});
```

---

## 3. Sequelize Adapter (`@angelitosystems/nest-auth-sequelize`)

### Installation
```bash
npm install @angelitosystems/nest-auth @angelitosystems/nest-auth-sequelize sequelize sequelize-typescript mysql2
```

### Models & Setup
```typescript
import { AUTH_MODELS, SequelizeAuthAdapter } from '@angelitosystems/nest-auth-sequelize';
import { Sequelize } from 'sequelize-typescript';

const sequelize = new Sequelize({
  dialect: 'mysql',
  database: 'app_db',
  username: 'root',
  password: 'password',
  models: [...AUTH_MODELS],
});

const adapter = new SequelizeAuthAdapter(sequelize);

AuthModule.forRoot({
  jwt: { secret: process.env.AUTH_JWT_SECRET! },
  adapter,
});
```

---

## 4. Mongoose Adapter (`@angelitosystems/nest-auth-mongoose`)

### Installation
```bash
npm install @angelitosystems/nest-auth @angelitosystems/nest-auth-mongoose mongoose
```

### Setup
```typescript
import mongoose from 'mongoose';
import { MongooseAuthAdapter } from '@angelitosystems/nest-auth-mongoose';

await mongoose.connect(process.env.MONGODB_URI!);
const adapter = new MongooseAuthAdapter(mongoose.connection);

AuthModule.forRoot({
  jwt: { secret: process.env.AUTH_JWT_SECRET! },
  adapter,
});
```
