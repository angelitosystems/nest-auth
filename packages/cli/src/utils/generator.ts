import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { ui } from './ui';

export interface GeneratorOptions {
  cwd: string;
  database: 'PostgreSQL' | 'MySQL' | 'MongoDB';
  orm: 'Prisma' | 'TypeORM' | 'Sequelize' | 'Mongoose';
  authStrategy: 'JWT' | 'Cookies' | 'JWT + Cookies';
  refreshTokens: boolean;
  emailVerification: boolean;
  passwordReset: boolean;
  twoFactor: boolean;
  roles: boolean;
  permissions: boolean;
  auditLogs: boolean;
  migrations: boolean;
  seed: boolean;
}

export function generateAuthScaffold(options: GeneratorOptions): void {
  const authDir = path.join(options.cwd, 'src', 'auth');
  fs.mkdirSync(authDir, { recursive: true });

  // 1. Generate .env entries
  appendEnvVars(options);

  // 2. Generate auth.module.ts
  generateAuthModule(options, authDir);

  // 3. Generate seed script if requested
  if (options.seed) {
    generateSeedScript(options, authDir);
  }

  // 4. Generate ORM specific artifacts
  if (options.orm === 'Prisma') {
    generatePrismaArtifacts(options);
  }

  console.log(ui.success(`Scaffolding generated successfully in ${ui.bold('src/auth/')}`));
}

function appendEnvVars(options: GeneratorOptions): void {
  const envPath = path.join(options.cwd, '.env');
  const jwtSecret = crypto.randomBytes(32).toString('hex');
  const sessionSecret = crypto.randomBytes(32).toString('hex');

  const lines = [
    '',
    '# ========================================================',
    '# @angelitosystems/nest-auth configuration',
    '# ========================================================',
    `AUTH_JWT_SECRET=${jwtSecret}`,
    'AUTH_ACCESS_TOKEN_EXPIRES_IN=15m',
    `AUTH_REFRESH_TOKEN_EXPIRES_IN=7d`,
    `AUTH_COOKIE_ENABLED=${options.authStrategy.includes('Cookies') ? 'true' : 'false'}`,
    `AUTH_COOKIE_NAME=access_token`,
    `AUTH_COOKIE_SECURE=false`,
    `AUTH_SESSIONS_ENABLED=true`,
    `AUTH_SEED_ADMIN_EMAIL=admin@example.com`,
    `AUTH_SEED_ADMIN_PASSWORD=AdminSecurePassword123!`,
  ];

  if (fs.existsSync(envPath)) {
    const existing = fs.readFileSync(envPath, 'utf8');
    if (!existing.includes('AUTH_JWT_SECRET')) {
      fs.appendFileSync(envPath, lines.join('\n') + '\n');
      console.log(ui.success('Appended auth configuration variables to .env'));
    }
  } else {
    fs.writeFileSync(envPath, lines.join('\n').trim() + '\n');
    console.log(ui.success('Created .env with secure random auth secrets'));
  }
}

function generateAuthModule(options: GeneratorOptions, authDir: string): void {
  let adapterImport = '';
  let adapterInstantiation = '';

  switch (options.orm) {
    case 'Prisma':
      adapterImport = `import { PrismaAuthAdapter } from '@angelitosystems/nest-auth-prisma';\nimport { PrismaClient } from '@prisma/client';`;
      adapterInstantiation = `const prisma = new PrismaClient();\n    const adapter = new PrismaAuthAdapter(prisma);`;
      break;
    case 'TypeORM':
      adapterImport = `import { TypeOrmAuthAdapter } from '@angelitosystems/nest-auth-typeorm';\nimport { DataSource } from 'typeorm';`;
      adapterInstantiation = `// Injects or accepts initialized TypeORM DataSource\n    // const adapter = new TypeOrmAuthAdapter(dataSource);`;
      break;
    case 'Sequelize':
      adapterImport = `import { SequelizeAuthAdapter } from '@angelitosystems/nest-auth-sequelize';\nimport { Sequelize } from 'sequelize-typescript';`;
      adapterInstantiation = `// Injects or accepts initialized Sequelize instance\n    // const adapter = new SequelizeAuthAdapter(sequelize);`;
      break;
    case 'Mongoose':
      adapterImport = `import { MongooseAuthAdapter } from '@angelitosystems/nest-auth-mongoose';\nimport { Connection } from 'mongoose';`;
      adapterInstantiation = `// Injects or accepts initialized Mongoose connection\n    // const adapter = new MongooseAuthAdapter(connection);`;
      break;
  }

  const moduleCode = `import { Module } from '@nestjs/common';
import { AuthModule as CoreAuthModule } from '@angelitosystems/nest-auth';
${adapterImport}

@Module({
  imports: [
    CoreAuthModule.forRootAsync({
      useFactory: () => {
        ${adapterInstantiation}

        return {
          jwt: {
            secret: process.env.AUTH_JWT_SECRET || 'fallback-secret-change-in-production',
            accessTokenExpiresIn: process.env.AUTH_ACCESS_TOKEN_EXPIRES_IN || '15m',
            refreshTokenExpiresIn: process.env.AUTH_REFRESH_TOKEN_EXPIRES_IN || '7d',
          },
          cookies: {
            enabled: ${options.authStrategy.includes('Cookies')},
            name: process.env.AUTH_COOKIE_NAME || 'access_token',
            secure: process.env.AUTH_COOKIE_SECURE === 'true',
            httpOnly: true,
            sameSite: 'lax',
          },
          sessions: {
            enabled: true,
            maxConcurrentSessions: 5,
          },
          features: {
            refreshTokens: ${options.refreshTokens},
            emailVerification: ${options.emailVerification},
            passwordReset: ${options.passwordReset},
            twoFactor: ${options.twoFactor},
            roles: ${options.roles},
            permissions: ${options.permissions},
            auditLogs: ${options.auditLogs},
          },
          adapter: adapter as any,
          globalGuard: true,
        };
      },
    }),
  ],
  exports: [CoreAuthModule],
})
export class AuthModule {}
`;

  fs.writeFileSync(path.join(authDir, 'auth.module.ts'), moduleCode);
}

function generateSeedScript(options: GeneratorOptions, authDir: string): void {
  const seedCode = `import { PasswordService } from '@angelitosystems/nest-auth';

export async function runAuthSeed(adapter: any) {
  console.log('🌱 Seeding initial roles and permissions...');

  // 1. Create Default Roles
  const adminRole = await adapter.roles.create('admin', 'Full system administrator', false);
  const userRole = await adapter.roles.create('user', 'Standard authenticated user', true);

  // 2. Create Core Permissions
  const permissions = [
    'users.*',
    'users.read',
    'users.create',
    'users.update',
    'users.delete',
    'roles.*',
    'permissions.*',
    'audit.read',
  ];

  for (const perm of permissions) {
    await adapter.permissions.create(perm, \`Permission for \${perm}\`);
    await adapter.roles.grantPermission(adminRole.id, perm);
  }

  // 3. Create Initial Admin User
  const passwordService = new PasswordService();
  const email = process.env.AUTH_SEED_ADMIN_EMAIL || 'admin@example.com';
  const plainPassword = process.env.AUTH_SEED_ADMIN_PASSWORD || 'AdminSecurePassword123!';

  const existing = await adapter.users.findByEmail(email);
  if (!existing) {
    const passwordHash = await passwordService.hash(plainPassword);
    const adminUser = await adapter.users.create({
      email,
      password_hash: passwordHash,
      first_name: 'Admin',
      last_name: 'System',
      is_active: true,
      is_email_verified: true,
    });

    await adapter.users.assignRole(adminUser.id, 'admin');
    console.log(\`✔ Admin user created: \${email}\`);
  } else {
    console.log(\`ℹ Admin user already exists: \${email}\`);
  }

  console.log('✅ Auth seeding completed successfully.');
}
`;

  fs.writeFileSync(path.join(authDir, 'seed.ts'), seedCode);
}

function generatePrismaArtifacts(options: GeneratorOptions): void {
  const prismaDir = path.join(options.cwd, 'prisma');
  fs.mkdirSync(prismaDir, { recursive: true });

  const schemaPath = path.join(prismaDir, 'schema.prisma');
  const prismaSchemaContent = `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id                         String              @id @default(uuid())
  email                      String              @unique
  password_hash              String
  first_name                 String?
  last_name                  String?
  is_active                  Boolean             @default(true)
  is_email_verified          Boolean             @default(false)
  two_factor_enabled         Boolean             @default(false)
  two_factor_secret          String?
  two_factor_recovery_codes  String[]            @default([])
  metadata                   Json?
  created_at                 DateTime            @default(now())
  updated_at                 DateTime            @updatedAt
  deleted_at                 DateTime?

  roles                      UserRole[]
  sessions                   Session[]
  refresh_tokens             RefreshToken[]
  password_resets            PasswordReset[]
  email_verifications        EmailVerification[]
  audit_logs                 AuditLog[]

  @@index([email])
  @@index([is_active])
  @@map("users")
}

model Role {
  id          String           @id @default(uuid())
  name        String           @unique
  description String?
  is_default  Boolean          @default(false)
  created_at  DateTime         @default(now())
  updated_at  DateTime         @updatedAt

  users       UserRole[]
  permissions RolePermission[]

  @@map("roles")
}

model Permission {
  id          String           @id @default(uuid())
  name        String           @unique
  description String?
  created_at  DateTime         @default(now())
  updated_at  DateTime         @updatedAt

  roles       RolePermission[]

  @@map("permissions")
}

model UserRole {
  user_id    String
  role_id    String
  created_at DateTime @default(now())

  user       User     @relation(fields: [user_id], references: [id], onDelete: Cascade)
  role       Role     @relation(fields: [role_id], references: [id], onDelete: Cascade)

  @@id([user_id, role_id])
  @@map("user_roles")
}

model RolePermission {
  role_id       String
  permission_id String
  created_at    DateTime   @default(now())

  role          Role       @relation(fields: [role_id], references: [id], onDelete: Cascade)
  permission    Permission @relation(fields: [permission_id], references: [id], onDelete: Cascade)

  @@id([role_id, permission_id])
  @@map("role_permissions")
}

model Session {
  id            String   @id @default(uuid())
  user_id       String
  token_hash    String   @unique
  ip_address    String?
  user_agent    String?
  device        String?
  is_revoked    Boolean  @default(false)
  last_activity DateTime @default(now())
  expires_at    DateTime
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt

  user          User     @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@index([user_id])
  @@index([token_hash])
  @@map("sessions")
}

model RefreshToken {
  id                     String   @id @default(uuid())
  user_id                String
  session_id             String?
  token_hash             String   @unique
  is_revoked             Boolean  @default(false)
  replaced_by_token_hash String?
  expires_at             DateTime
  created_at             DateTime @default(now())

  user                   User     @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@index([user_id])
  @@index([token_hash])
  @@map("refresh_tokens")
}

model PasswordReset {
  id         String   @id @default(uuid())
  user_id    String
  token_hash String   @unique
  is_used    Boolean  @default(false)
  expires_at DateTime
  created_at DateTime @default(now())

  user       User     @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@index([user_id])
  @@index([token_hash])
  @@map("password_resets")
}

model EmailVerification {
  id         String   @id @default(uuid())
  user_id    String
  token_hash String   @unique
  is_used    Boolean  @default(false)
  expires_at DateTime
  created_at DateTime @default(now())

  user       User     @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@index([user_id])
  @@index([token_hash])
  @@map("email_verifications")
}

model AuditLog {
  id          String   @id @default(uuid())
  user_id     String?
  action      String
  entity      String
  entity_id   String?
  method      String?
  route       String?
  ip          String?
  user_agent  String?
  old_values  Json?
  new_values  Json?
  metadata    Json?
  created_at  DateTime @default(now())

  user        User?    @relation(fields: [user_id], references: [id], onDelete: SetNull)

  @@index([user_id])
  @@index([action])
  @@index([entity])
  @@map("audit_logs")
}
`;

  if (!fs.existsSync(schemaPath)) {
    fs.writeFileSync(schemaPath, prismaSchemaContent);
    console.log(ui.success('Generated prisma/schema.prisma template'));
  }
}
