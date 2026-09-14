# Changelog

All notable changes to `@angelitosystems/nest-auth` and `nest-auth-kit` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-09-14

### Added
- **Core Package (`@angelitosystems/nest-auth`)**:
  - Modular authentication module (`AuthModule.forRoot` and `AuthModule.forRootAsync`).
  - Dual authentication delivery: JWT (Bearer header) and Secure httpOnly Cookies.
  - Refresh token rotation with SHA-256 database hashing and reuse attack detection.
  - Role-Based Access Control (RBAC) with `@Roles()` and `RolesGuard` supporting `OR` and `AND` evaluation modes.
  - Granular permissions with `@Permissions()`, `PermissionsGuard`, and wildcard support (`users.*`, `*`).
  - Multi-device session management with IP tracking, device classification, and concurrent session limits.
  - RFC 6238 compliant Two-Factor Authentication (2FA TOTP) with cryptographically hashed recovery codes.
  - Automated audit logging with `@Audited()` decorator and `AuditInterceptor`.
  - Password security using 100,000-iteration PBKDF2 (SHA-512) and constant-time string comparison (`crypto.timingSafeEqual`).
  - Email verification and password reset workflows with single-use hashed tokens and `MailProvider` abstraction.
  - Decoupled domain events (`UserRegisteredEvent`, `UserLoggedInEvent`, `PasswordResetEvent`, etc.).
- **Database Adapters**:
  - `@angelitosystems/nest-auth-prisma`: PostgreSQL and MySQL adapter with comprehensive Prisma schema.
  - `@angelitosystems/nest-auth-typeorm`: PostgreSQL and MySQL adapter with TypeORM entities.
  - `@angelitosystems/nest-auth-sequelize`: MySQL and PostgreSQL adapter with Sequelize-TypeScript models.
  - `@angelitosystems/nest-auth-mongoose`: MongoDB adapter with Mongoose schemas and auto-indexing.
- **CLI Toolkit (`nest-auth-kit`)**:
  - Interactive setup wizard: `nest-auth-kit init`.
  - Environment diagnostics: `nest-auth-kit doctor`.
  - Migration runners: `nest-auth-kit migrate`.
  - Database seeder: `nest-auth-kit seed`.
  - Component generators: `nest-auth-kit generate`.
- **Documentation & CI/CD**:
  - Bilingual documentation portal (English / Spanish) with interactive search, dark mode, and terminal blocks.
  - GitHub Actions workflows for CI, Releases, and GitHub Pages deployment.
  - Multi-stage Dockerfile and `docker-compose.yml` for local database environments.
