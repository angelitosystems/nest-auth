# `nest-auth-kit` CLI Reference

`nest-auth-kit` is the official command-line interface for scaffolding, configuring, migrating, and diagnosing `@angelitosystems/nest-auth` projects.

---

## Commands

### `nest-auth-kit init`

Runs the interactive initialization wizard.

```bash
npx nest-auth-kit init
```

Options:
- `-y, --yes`: Non-interactive mode using recommended enterprise defaults (PostgreSQL, Prisma, JWT, all features enabled).

#### Prompts Included:
- **Database**: PostgreSQL / MySQL / MongoDB
- **ORM / ODM**:
  - PostgreSQL: Prisma, TypeORM
  - MySQL: TypeORM, Sequelize
  - MongoDB: Mongoose
- **Authentication**: JWT, Cookies, JWT + Cookies
- **Refresh Tokens**: Yes / No
- **Email Verification**: Yes / No
- **Password Reset**: Yes / No
- **2FA TOTP**: Yes / No
- **Roles**: Yes / No
- **Permissions**: Yes / No
- **Audit Logs**: Yes / No
- **Generate Migrations**: Yes / No
- **Generate Seed**: Yes / No

---

### `nest-auth-kit doctor`

Runs comprehensive environment and configuration diagnostics.

```bash
npx nest-auth-kit doctor
```

Checks performed:
- Node.js runtime version compatibility (Node 18+)
- NestJS presence (`@nestjs/core`, `@nestjs/common`) and version
- TypeScript configuration (`tsconfig.json`)
- Detected ORM / ODM (Prisma, TypeORM, Sequelize, Mongoose)
- Project configuration file (`.env`)
- `AUTH_JWT_SECRET` presence and validity
- Database connection string (`DATABASE_URL` / `MONGODB_URI`)
- Admin seed credentials (`AUTH_SEED_ADMIN_EMAIL`, `AUTH_SEED_ADMIN_PASSWORD`)

Output example:
```text
✔ Node.js version compatible (v22.10.5)
✔ NestJS detected (^10.4.15)
✔ TypeScript configured (tsconfig.json present)
✔ ORM detected: prisma
✔ Environment file found (.env)
✔ AUTH_JWT_SECRET configured
✔ Database connection string configured
✔ Initial admin seed credentials configured
```

---

### `nest-auth-kit migrate`

Dispatches migration commands tailored to your detected ORM:

```bash
# Run pending migrations
npx nest-auth-kit migrate

# Create a new migration
npx nest-auth-kit migrate create AddUserProfileFields

# Revert the last migration
npx nest-auth-kit migrate revert
```

Adapter mapping:
- **Prisma**: Executes `prisma migrate dev`
- **TypeORM**: Executes `typeorm migration:run` / `typeorm migration:create` / `typeorm migration:revert`
- **Sequelize**: Executes `sequelize-cli db:migrate` / `sequelize-cli migration:generate` / `sequelize-cli db:migrate:undo`
- **Mongoose**: Auto-synchronizes schema indexes on app startup

---

### `nest-auth-kit seed`

Seeds default roles (`admin`, `user`), default permissions (`users.*`, `roles.*`, `permissions.*`, `audit.read`), and initial admin user using `.env` credentials.

```bash
npx nest-auth-kit seed
```

Environment variables used:
```env
AUTH_SEED_ADMIN_EMAIL=admin@example.com
AUTH_SEED_ADMIN_PASSWORD=AdminSecurePassword123!
```

---

### `nest-auth-kit generate <schematic> [name]`

Generates custom auth components directly into `src/auth/`:

```bash
# Generate a custom guard
npx nest-auth-kit generate guard Subscription

# Generate a custom decorator
npx nest-auth-kit generate decorator Plan

# Generate a custom auth controller
npx nest-auth-kit generate controller Account

# Generate a custom auth service
npx nest-auth-kit generate service Mfa
```

---

### `nest-auth-kit info`

Displays installed environment details, Node.js version, NestJS version, and nest-auth package status.

```bash
npx nest-auth-kit info
```
