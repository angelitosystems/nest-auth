# API Reference

`@angelitosystems/nest-auth` provides both automatic endpoints and programmatic services.

---

## Built-in Endpoints (`AuthController`)

If enabled via `controllers: { auth: true }` (enabled by default):

### Public Routes

| Method | Route | Description |
| :--- | :--- | :--- |
| `POST` | `/auth/register` | Registers a new user and issues tokens |
| `POST` | `/auth/login` | Authenticates with email and password (or 2FA challenge) |
| `POST` | `/auth/refresh` | Rotates refresh token and issues new access token |
| `POST` | `/auth/forgot-password` | Requests password reset instructions and single-use token |
| `POST` | `/auth/reset-password` | Confirms password reset with token and new password |
| `POST` | `/auth/verify-email` | Verifies user email with token |
| `POST` | `/auth/resend-verification` | Resends verification token |

### Protected Routes (Requires AuthGuard)

| Method | Route | Description |
| :--- | :--- | :--- |
| `POST` | `/auth/logout` | Revokes current session and refresh token |
| `GET`  | `/auth/me` | Returns sanitized profile of authenticated user |
| `POST` | `/auth/2fa/setup` | Generates 2FA secret, recovery codes, and otpauth URI |
| `POST` | `/auth/2fa/enable` | Verifies code and activates 2FA on account |
| `POST` | `/auth/2fa/disable` | Deactivates 2FA with verified TOTP code |
| `GET`  | `/auth/sessions` | Lists active sessions and devices |
| `DELETE` | `/auth/sessions/:id` | Revokes specific session |
| `DELETE` | `/auth/sessions` | Revokes all other sessions except current |

---

## Decorators

### `@CurrentUser(field?: string)`
Injects the authenticated user into controller route handlers:
```typescript
@Get('me')
getMe(@CurrentUser() user: User) {}

@Get('id')
getId(@CurrentUser('id') userId: string) {}
```

### `@Public()`
Exempts a route from the global `AuthGuard`:
```typescript
@Public()
@Get('health')
health() {}
```

### `@Roles(...roles: string[])`
Specifies required roles. Default mode is `OR`.
```typescript
@Roles('admin', 'manager')
@Get('dashboard')
dashboard() {}
```

### `@RolesMode(mode: 'OR' | 'AND')`
Configures role evaluation logic for handler:
```typescript
@Roles('admin', 'editor')
@RolesMode('AND')
@Get('restricted')
restricted() {}
```

### `@Permissions(...permissions: string[])`
Specifies required granular permissions. Supports exact match and wildcards:
```typescript
@Permissions('users.create', 'users.update')
@Post()
create() {}
```

### `@Audited(options?: { action?: string; entity?: string })`
Flags a controller or handler for automatic audit logging.

---

## Guards & Interceptors

- `AuthGuard`: Validates access token from Bearer header or cookies, checks user activity and session revocation.
- `RolesGuard`: Validates role claims against required roles.
- `PermissionsGuard`: Validates permissions against required permissions with wildcard resolution (`users.*`, `*`).
- `AuditInterceptor`: Intercepts and logs mutation actions, entities, diffs, and metadata into audit trail.

---

## Services

- `AuthService`: Full lifecycle management (registration, login, refresh, password reset, 2FA, etc.).
- `SessionService`: Multi-device session tracking and revocation.
- `AuditService`: Query and record audit events.
- `PasswordService`: Timing-safe PBKDF2 hashing and verification.
- `TokenService`: JWT signing, verification, and expiration handling.
- `TwoFactorService`: RFC 6238 TOTP engine, secret generation, and recovery code verification.
- `MailService`: Email notifications wrapper via `MailProvider`.
