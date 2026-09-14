# Security & Architecture Best Practices

`@angelitosystems/nest-auth` implements defense-in-depth security principles.

---

## 1. Password Hashing & Timing-Attack Mitigation

- Passwords are never stored in plaintext.
- Hashes are created with cryptographic salt using 100,000 iterations of PBKDF2 (SHA-512) or scrypt.
- Password verification utilizes `crypto.timingSafeEqual` to eliminate side-channel timing attacks.

```typescript
const isMatch = crypto.timingSafeEqual(derivedKeyBuffer, storedKeyBuffer);
```

---

## 2. Refresh Token Rotation & Reuse Attack Detection

Refresh tokens are single-use credentials:
1. Each refresh request validates the presented token hash in the database.
2. If the token was **already revoked**, the system assumes an attacker intercepted a prior token!
3. **Immediate countermeasure**: All refresh tokens and active sessions for that user account are instantly revoked.
4. If valid, the old token is marked revoked and atomically replaced by a newly generated refresh token.
5. In the database, only the **SHA-256 hash** of the refresh token is stored. Even a database dump will not expose valid refresh tokens.

---

## 3. Session Management & Hijacking Mitigation

- Tracks client IP address, device type, and User-Agent.
- Enforces maximum concurrent sessions per user (e.g. max 5 devices).
- Password change or reset events automatically revoke all active sessions for that user account.
- User can inspect active devices (`GET /auth/sessions`) and terminate remote sessions (`DELETE /auth/sessions/:id` or `DELETE /auth/sessions`).

---

## 4. Two-Factor Authentication (RFC 6238 TOTP)

- Implements standard Time-Based One-Time Password algorithm.
- Secret is encoded in Base32 and compatible with Google Authenticator, Authy, and 1Password.
- Generates 8 cryptographically secure recovery codes.
- Recovery codes are stored as SHA-256 hashes in the database. Once used, a recovery code is immediately invalidated.

---

## 5. Automated Audit Trail

The `@Audited()` decorator and `AuditInterceptor` log security-critical mutations:
- `LOGIN`, `LOGIN_FAILED`, `LOGOUT`
- `PASSWORD_CHANGED`, `PASSWORD_RESET`, `EMAIL_VERIFIED`
- `USER_CREATED`, `USER_UPDATED`, `USER_DELETED`
- `ROLE_ASSIGNED`, `ROLE_REMOVED`
- `PERMISSION_GRANTED`, `PERMISSION_REVOKED`

Each entry captures:
- User ID
- Timestamp
- Action & Entity
- Route & HTTP Method
- IP address & User-Agent
- Pre-mutation state (`old_values`) and post-mutation state (`new_values`)
- Request metadata
