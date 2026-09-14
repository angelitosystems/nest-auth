export interface DocSectionContent {
  titleEn: string;
  titleEs: string;
  leadEn: string;
  leadEs: string;
  bodyEn: string;
  bodyEs: string;
  codeSnippet?: {
    language: string;
    filename?: string;
    code: string;
  };
  terminalSnippet?: {
    title: string;
    command: string;
    lines: { type: 'input' | 'output' | 'success' | 'warn' | 'info' | 'dim'; text: string }[];
  };
}

export const docsContentMap: Record<string, DocSectionContent> = {
  introduction: {
    titleEn: 'Introduction to @angelitosystems/nest-auth',
    titleEs: 'Introducción a @angelitosystems/nest-auth',
    leadEn: 'A modular, enterprise-grade authentication and authorization ecosystem for NestJS applications.',
    leadEs: 'Un ecosistema modular y empresarial de autenticación y autorización para aplicaciones NestJS.',
    bodyEn: `**@angelitosystems/nest-auth** is not just a simple JWT helper. It is a complete, production-grade security and identity architecture engineered by **Angelito Systems** for modern NestJS microservices and web APIs.

### Core Architectural Pillars
- **Decoupled Database Abstraction**: The Core has zero database dependencies. Adapters implement strict TypeScript repository contracts for Prisma, TypeORM, Sequelize, and Mongoose.
- **Dual Authentication Delivery**: Support for standard Bearer tokens in Authorization headers, secure \`httpOnly\` cookies, or a hybrid strategy.
- **Defense-in-Depth Security**: Constant-time comparison (\`crypto.timingSafeEqual\`), token reuse attack detection, PBKDF2 hashing, and RFC 6238 2FA.
- **Multi-Device Sessions**: Real-time tracking of IP, device, User-Agent, and remote session revocation.
- **Granular RBAC & Wildcard Permissions**: Declarative \`@Roles()\` and \`@Permissions()\` with wildcard expansion (\`users.*\`, \`*\`).
- **Automated Audit Logging**: Every mutating action can be tracked with \`@Audited()\` and the \`AuditInterceptor\`.`,
    bodyEs: `**@angelitosystems/nest-auth** no es una simple librería para firmar JWTs. Es una arquitectura completa y lista para producción desarrollada por **Angelito Systems** para microservicios y APIs modernas en NestJS.

### Pilares Arquitectónicos
- **Abstracción Desacoplada de Base de Datos**: El Core no depende de ningún ORM específico. Los adaptadores implementan contratos estrictos de repositorio en TypeScript para Prisma, TypeORM, Sequelize y Mongoose.
- **Doble Entrega de Tokens**: Soporte para Bearer tokens en headers de Autorización, cookies seguras \`httpOnly\` o modo híbrido.
- **Seguridad en Profundidad**: Comparación en tiempo constante (\`crypto.timingSafeEqual\`), detección de ataques de reuso de tokens, hash PBKDF2 y 2FA RFC 6238.
- **Sesiones Multi-Dispositivo**: Rastreo en tiempo real de IP, dispositivo, User-Agent y revocación remota de sesiones.
- **RBAC Granular y Permisos con Comodines**: Decoradores declarativos \`@Roles()\` y \`@Permissions()\` con comodines (\`users.*\`, \`*\`).
- **Pista de Auditoría Automática**: Registro automático de mutaciones con \`@Audited()\` y el interceptor \`AuditInterceptor\`.`,
    codeSnippet: {
      language: 'typescript',
      filename: 'app.module.ts',
      code: `import { Module } from '@nestjs/common';
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
      adapter,
      globalGuard: true, // Automatically protect all routes!
    }),
  ],
})
export class AppModule {}`,
    },
  },

  installation: {
    titleEn: 'Installation',
    titleEs: 'Instalación',
    leadEn: 'Install the core package alongside your chosen database adapter.',
    leadEs: 'Instala el paquete central junto al adaptador de base de datos correspondiente.',
    bodyEn: `Install **@angelitosystems/nest-auth** and only the database adapter you actually use. Zero bloat, zero unnecessary ORM dependencies.`,
    bodyEs: `Instala **@angelitosystems/nest-auth** y únicamente el adaptador que tu base de datos requiere. Cero dependencias innecesarias de ORMs no utilizados.`,
    codeSnippet: {
      language: 'bash',
      filename: 'Terminal',
      code: `# 1. Install Core Package
npm install @angelitosystems/nest-auth

# 2. Install Your Database Adapter:
# For PostgreSQL / MySQL with Prisma:
npm install @angelitosystems/nest-auth-prisma @prisma/client

# For PostgreSQL / MySQL with TypeORM:
npm install @angelitosystems/nest-auth-typeorm typeorm

# For MySQL / PostgreSQL with Sequelize:
npm install @angelitosystems/nest-auth-sequelize sequelize sequelize-typescript

# For MongoDB with Mongoose:
npm install @angelitosystems/nest-auth-mongoose mongoose`,
    },
  },

  'quick-start': {
    titleEn: 'Quick Start (CLI Wizard)',
    titleEs: 'Inicio Rápido (Asistente CLI)',
    leadEn: 'Bootstrap a complete authentication system in 5 minutes with nest-auth-kit.',
    leadEs: 'Configura un sistema de autenticación completo en 5 minutos con nest-auth-kit.',
    bodyEn: `The fastest way to scaffold your authentication system is using the official CLI toolkit **nest-auth-kit**.

Inside your NestJS project directory, run:
\`npx nest-auth-kit init\`

The interactive wizard asks what database, ORM, and features you need, then automatically generates all modules, guards, decorators, and environment templates.`,
    bodyEs: `La forma más rápida de configurar tu sistema de autenticación es utilizando la herramienta CLI oficial **nest-auth-kit**.

Dentro del directorio de tu proyecto NestJS, ejecuta:
\`npx nest-auth-kit init\`

El asistente interactivo te preguntará qué base de datos, ORM y características necesitas, y generará automáticamente todos los módulos, guards, decoradores y archivos de configuración.`,
    terminalSnippet: {
      title: 'Terminal · npx nest-auth-kit init',
      command: 'npx nest-auth-kit init',
      lines: [
        { type: 'info', text: '🔍 Analyzing project environment...' },
        { type: 'success', text: '✔ NestJS detected (^10.4.15)' },
        { type: 'success', text: '✔ TypeScript detected (tsconfig.json)' },
        { type: 'input', text: '? Select your database: PostgreSQL' },
        { type: 'input', text: '? Select ORM adapter: Prisma' },
        { type: 'input', text: '? Authentication strategy: JWT + Cookies' },
        { type: 'input', text: '? Enable Refresh Tokens: Yes' },
        { type: 'input', text: '? Enable Two-Factor Authentication (2FA): Yes' },
        { type: 'success', text: '✔ Scaffolding generated in src/auth/' },
        { type: 'info', text: 'Next step: run npx nest-auth-kit doctor' },
      ],
    },
  },

  cli: {
    titleEn: 'CLI Toolkit Reference',
    titleEs: 'Referencia de la Herramienta CLI',
    leadEn: 'Commands and workflow utilities provided by nest-auth-kit.',
    leadEs: 'Comandos y utilidades de flujo de trabajo proporcionadas por nest-auth-kit.',
    bodyEn: `**nest-auth-kit** is a first-class CLI designed to streamline authentication workflows throughout the entire project lifecycle.

### Command List
- \`npx nest-auth-kit init\`: Guided setup wizard.
- \`npx nest-auth-kit doctor\`: Diagnostics tool checking Node, NestJS, TypeScript, ORM, and .env secrets.
- \`npx nest-auth-kit migrate\`: Runs, creates, or reverts database migrations.
- \`npx nest-auth-kit seed\`: Seeds initial roles (admin, user), default permissions, and administrator user.
- \`npx nest-auth-kit generate <schematic> [name]\`: Generates custom guards, decorators, controllers, and services.
- \`npx nest-auth-kit info\`: Displays installed versions and configuration.`,
    bodyEs: `**nest-auth-kit** es un CLI de primer nivel diseñado para agilizar los flujos de trabajo de autenticación durante todo el ciclo de vida del proyecto.

### Lista de Comandos
- \`npx nest-auth-kit init\`: Asistente de configuración guiada.
- \`npx nest-auth-kit doctor\`: Herramienta de diagnóstico que verifica Node, NestJS, TypeScript, ORM y variables de entorno.
- \`npx nest-auth-kit migrate\`: Ejecuta, crea o revierte migraciones de base de datos.
- \`npx nest-auth-kit seed\`: Siembra roles iniciales (admin, user), permisos y usuario administrador.
- \`npx nest-auth-kit generate <schematic> [name]\`: Genera guards, decoradores, controladores y servicios.
- \`npx nest-auth-kit info\`: Muestra información de versiones y configuración instalada.`,
    codeSnippet: {
      language: 'bash',
      filename: 'CLI Commands',
      code: `# Diagnose configuration health
npx nest-auth-kit doctor

# Seed initial admin and roles
npx nest-auth-kit seed

# Generate a custom subscription guard
npx nest-auth-kit generate guard Subscription`,
    },
  },

  jwt: {
    titleEn: 'JWT Strategy & Bearer Tokens',
    titleEs: 'Estrategia JWT y Bearer Tokens',
    leadEn: 'Stateless access token verification with HMAC-SHA256 signature and expiration.',
    leadEs: 'Verificación de access tokens sin estado con firma HMAC-SHA256 y expiración configurable.',
    bodyEn: `The JWT engine creates cryptographically signed access tokens containing the user's \`sub\` (ID), \`email\`, assigned \`roles\`, and \`permissions\`.

Tokens are verified in constant time. When \`globalGuard: true\` is configured, all incoming HTTP requests must supply a valid Bearer token in the \`Authorization\` header unless decorated with \`@Public()\`.`,
    bodyEs: `El motor JWT crea tokens de acceso firmados criptográficamente que contienen el \`sub\` (ID), \`email\`, \`roles\` asignados y \`permissions\` del usuario.

Los tokens se verifican en tiempo constante. Con \`globalGuard: true\`, todas las solicitudes deben incluir un Bearer token en el header \`Authorization\`, excepto aquellas decoradas con \`@Public()\`.`,
    codeSnippet: {
      language: 'typescript',
      filename: 'jwt-config.ts',
      code: `AuthModule.forRoot({
  jwt: {
    secret: process.env.AUTH_JWT_SECRET!, // At least 32 characters
    accessTokenExpiresIn: '15m',
    refreshTokenExpiresIn: '7d',
    issuer: 'https://auth.angelitosystems.com',
    audience: 'https://api.angelitosystems.com',
  },
  adapter,
});`,
    },
  },

  cookies: {
    titleEn: 'HttpOnly Cookies Strategy',
    titleEs: 'Estrategia con Cookies HttpOnly',
    leadEn: 'Secure cookie storage protecting tokens from XSS attacks.',
    leadEs: 'Almacenamiento seguro en cookies protegiendo los tokens contra ataques XSS.',
    bodyEn: `When cookie delivery is enabled, the authentication system sets access and refresh tokens directly in HTTP response headers with \`httpOnly: true\`, preventing malicious JavaScript from stealing user credentials.`,
    bodyEs: `Cuando se habilitan las cookies, el sistema establece los tokens directamente en los headers HTTP con \`httpOnly: true\`, evitando que scripts maliciosos de JavaScript accedan a las credenciales.`,
    codeSnippet: {
      language: 'typescript',
      filename: 'cookies-config.ts',
      code: `AuthModule.forRoot({
  jwt: { secret: process.env.AUTH_JWT_SECRET! },
  cookies: {
    enabled: true,
    name: 'access_token',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes in ms
  },
  adapter,
});`,
    },
  },

  sessions: {
    titleEn: 'Multi-Device Session Management',
    titleEs: 'Gestión de Sesiones Multi-Dispositivo',
    leadEn: 'Inspect active devices, limit concurrent logins, and revoke remote sessions.',
    leadEs: 'Inspecciona dispositivos activos, limita inicios simultáneos y revoca sesiones remotas.',
    bodyEn: `Each login generates a tracked session record capturing:
- **Client IP address**
- **User-Agent & Device type** (Desktop, Mobile, Tablet)
- **Last activity timestamp**
- **Expiration date**

Users can inspect all active sessions via \`GET /auth/sessions\`, terminate a specific session via \`DELETE /auth/sessions/:id\`, or log out from all other devices with \`DELETE /auth/sessions\`.`,
    bodyEs: `Cada inicio de sesión genera un registro capturando:
- **Dirección IP del cliente**
- **User-Agent y tipo de dispositivo** (Desktop, Móvil, Tablet)
- **Marca de tiempo de última actividad**
- **Fecha de expiración**

Los usuarios pueden consultar sus sesiones con \`GET /auth/sessions\`, cerrar sesión en un dispositivo específico con \`DELETE /auth/sessions/:id\` o cerrar todas las demás sesiones con \`DELETE /auth/sessions\`.`,
    codeSnippet: {
      language: 'typescript',
      filename: 'session-example.ts',
      code: `// Built-in Session Controller Endpoints:
// GET    /auth/sessions        -> Lists all active sessions for current user
// DELETE /auth/sessions/:id    -> Revokes specific session by ID
// DELETE /auth/sessions        -> Revokes all other sessions except current`,
    },
  },

  'refresh-tokens': {
    titleEn: 'Refresh Tokens & Rotation',
    titleEs: 'Tokens de Refresco y Rotación',
    leadEn: 'Single-use refresh tokens with automatic rotation and reuse attack detection.',
    leadEs: 'Tokens de refresco de un solo uso con rotación automática y detección de ataques de reuso.',
    bodyEn: `Refresh tokens are stored in the database as **SHA-256 hashes**. When a refresh token is exchanged:
1. The old token is marked revoked and linked to the new replacement hash.
2. A new token pair is issued.
3. If an already-revoked refresh token is ever submitted, the system flags a **token reuse attack** and instantly invalidates all active tokens and sessions for that user account!`,
    bodyEs: `Los tokens de refresco se almacenan en la base de datos como **hashes SHA-256**. Al intercambiar un token:
1. El token anterior se marca como revocado y se vincula al nuevo hash.
2. Se emite un nuevo par de tokens.
3. Si un token revocado vuelve a presentarse, el sistema detecta un **ataque de reuso** e invalida inmediatamente todas las sesiones y tokens de la cuenta.`,
    codeSnippet: {
      language: 'typescript',
      filename: 'refresh.dto.ts',
      code: `// POST /auth/refresh
// Body: { "refreshToken": "..." }
// Returns: { "accessToken": "...", "refreshToken": "...", "expiresIn": 900 }`,
    },
  },

  passwords: {
    titleEn: 'Password Security & Reset',
    titleEs: 'Seguridad y Recuperación de Contraseñas',
    leadEn: '100,000-iteration PBKDF2 (SHA-512) hashing and single-use password reset tokens.',
    leadEs: 'Hash PBKDF2 (SHA-512) con 100,000 iteraciones y tokens de recuperación de un solo uso.',
    bodyEn: `Passwords are hashed using cryptographically random salts with 100,000 iterations of PBKDF2. Verifications use \`crypto.timingSafeEqual\` to prevent side-channel timing attacks.

Password reset requests generate single-use tokens with a 1-hour expiration. Once reset, all existing user sessions are revoked automatically.`,
    bodyEs: `Las contraseñas se hashean con sales criptográficas y 100,000 iteraciones de PBKDF2. Las verificaciones emplean \`crypto.timingSafeEqual\` para prevenir ataques de temporización.

La recuperación genera tokens de un solo uso con 1 hora de validez. Tras cambiar la contraseña, todas las sesiones activas se revocan de forma inmediata.`,
    codeSnippet: {
      language: 'typescript',
      filename: 'password-reset-flow.ts',
      code: `// Step 1: Request reset email
// POST /auth/forgot-password -> { "email": "user@example.com" }

// Step 2: Confirm password change
// POST /auth/reset-password  -> { "token": "...", "newPassword": "SecurePassword123!" }`,
    },
  },

  'two-factor': {
    titleEn: 'Two-Factor Authentication (2FA TOTP)',
    titleEs: 'Autenticación en Dos Pasos (2FA TOTP)',
    leadEn: 'RFC 6238 TOTP engine, QR code generation, and 8 single-use hashed recovery codes.',
    leadEs: 'Motor TOTP RFC 6238, generación de códigos QR y 8 códigos de recuperación hasheados.',
    bodyEn: `Two-factor authentication is compatible with Google Authenticator, Authy, and 1Password.

- Secret keys are encoded in Base32.
- Generates 8 single-use recovery codes, stored as SHA-256 hashes.
- Once 2FA is active, login requests require verifying the 6-digit TOTP code before issuing credentials.`,
    bodyEs: `La autenticación en dos pasos es compatible con Google Authenticator, Authy y 1Password.

- Claves secretas codificadas en Base32.
- Generación de 8 códigos de recuperación hasheados de un solo uso.
- Con 2FA activo, el login exige verificar el código TOTP de 6 dígitos antes de emitir credenciales.`,
    codeSnippet: {
      language: 'typescript',
      filename: 'two-factor-setup.ts',
      code: `// 1. Setup: POST /auth/2fa/setup (Requires AuthGuard)
// Returns: { secret, otpAuthUrl, recoveryCodes }

// 2. Enable: POST /auth/2fa/enable
// Body: { "code": "123456" }

// 3. Login with 2FA:
// POST /auth/login -> { "email": "...", "password": "...", "twoFactorCode": "123456" }`,
    },
  },

  roles: {
    titleEn: 'Role-Based Access Control (@Roles)',
    titleEs: 'Control de Acceso Basado en Roles (@Roles)',
    leadEn: 'Declarative endpoint protection with RolesGuard supporting OR and AND modes.',
    leadEs: 'Protección declarativa con RolesGuard en modos configurables OR y AND.',
    bodyEn: `Protect endpoints using the \`@Roles()\` decorator. By default, specifying multiple roles operates in \`OR\` mode (the user must possess at least one of the roles).

To require all specified roles, use \`@RolesMode('AND')\`.`,
    bodyEs: `Protege endpoints con el decorador \`@Roles()\`. Por defecto, opera en modo \`OR\` (el usuario debe poseer al menos uno de los roles).

Para exigir todos los roles indicados, utiliza \`@RolesMode('AND')\`.`,
    codeSnippet: {
      language: 'typescript',
      filename: 'roles-controller.ts',
      code: `import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles, RolesGuard, RolesMode } from '@angelitosystems/nest-auth';

@Controller('management')
@UseGuards(RolesGuard)
export class ManagementController {
  // Allows user with 'admin' OR 'manager'
  @Roles('admin', 'manager')
  @Get('reports')
  getReports() {
    return { reports: [] };
  }

  // Requires BOTH 'admin' AND 'finance'
  @Roles('admin', 'finance')
  @RolesMode('AND')
  @Get('audit-financial')
  getFinancialAudit() {
    return { balance: 1000000 };
  }
}`,
    },
  },

  permissions: {
    titleEn: 'Granular Permissions with Wildcards',
    titleEs: 'Permisos Granulares con Comodines',
    leadEn: 'Enforce specific permissions with wildcard pattern expansion (users.*, *).',
    leadEs: 'Aplica permisos específicos con expansión de comodines (users.*, *).',
    bodyEn: `The \`@Permissions()\` decorator and \`PermissionsGuard\` validate user permissions against required claims.

### Supported Patterns
- **Exact Match**: \`users.create\` matches \`users.create\`.
- **Prefix Wildcard**: \`users.*\` matches \`users.read\`, \`users.create\`, \`users.delete\`.
- **Global Superuser**: \`*\` matches any permission in the entire application.`,
    bodyEs: `El decorador \`@Permissions()\` y el \`PermissionsGuard\` validan los permisos del usuario.

### Patrones Soportados
- **Coincidencia Exacta**: \`users.create\` coincide con \`users.create\`.
- **Comodín de Prefijo**: \`users.*\` coincide con \`users.read\`, \`users.create\`, \`users.delete\`.
- **Superusuario Global**: \`*\` coincide con cualquier permiso de la aplicación.`,
    codeSnippet: {
      language: 'typescript',
      filename: 'permissions-controller.ts',
      code: `import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { Permissions, PermissionsGuard } from '@angelitosystems/nest-auth';

@Controller('users')
@UseGuards(PermissionsGuard)
export class UsersController {
  // Matches exact 'users.delete', 'users.*', or '*'
  @Permissions('users.delete')
  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return { deleted: true };
  }
}`,
    },
  },

  guards: {
    titleEn: 'Guards Architecture',
    titleEs: 'Arquitectura de Guards',
    leadEn: 'AuthGuard, RolesGuard, and PermissionsGuard work together seamlessly.',
    leadEs: 'AuthGuard, RolesGuard y PermissionsGuard colaboran de forma transparente.',
    bodyEn: `Nest-Auth supplies three production-grade guards:
1. **AuthGuard**: Validates JWT Bearer tokens or cookies, verifies session revocation, and attaches the user to the request.
2. **RolesGuard**: Checks user roles against \`@Roles()\`.
3. **PermissionsGuard**: Checks permissions with wildcard matching against \`@Permissions()\`.

When \`globalGuard: true\` is configured, \`AuthGuard\` is registered globally as \`APP_GUARD\`.`,
    bodyEs: `Nest-Auth proporciona tres guards empresariales:
1. **AuthGuard**: Valida tokens JWT o cookies, comprueba sesiones y adjunta el usuario a la petición.
2. **RolesGuard**: Comprueba los roles del usuario contra \`@Roles()\`.
3. **PermissionsGuard**: Comprueba permisos y comodines contra \`@Permissions()\`.

Con \`globalGuard: true\`, \`AuthGuard\` se registra automáticamente de manera global como \`APP_GUARD\`.`,
    codeSnippet: {
      language: 'typescript',
      filename: 'guards-usage.ts',
      code: `// Enable global guard in AppModule:
AuthModule.forRoot({
  jwt: { secret: process.env.AUTH_JWT_SECRET! },
  adapter,
  globalGuard: true,
});

// Exempt public endpoints:
@Public()
@Get('health')
healthCheck() {
  return { status: 'healthy' };
}`,
    },
  },

  decorators: {
    titleEn: 'Decorators Reference',
    titleEs: 'Referencia de Decoradores',
    leadEn: '@CurrentUser(), @Public(), @Roles(), @Permissions(), and @Audited().',
    leadEs: '@CurrentUser(), @Public(), @Roles(), @Permissions() y @Audited().',
    bodyEn: `Convenient decorators provided by **@angelitosystems/nest-auth**:
- \`@CurrentUser(field?)\`: Extracts the authenticated user object or a specific field (e.g. \`@CurrentUser('id')\`).
- \`@Public()\`: Bypasses authentication for public routes.
- \`@Roles(...roles)\`: Declares required roles.
- \`@RolesMode('OR' | 'AND')\`: Sets role evaluation logic.
- \`@Permissions(...permissions)\`: Declares required permissions.
- \`@Audited(options?)\`: Flags route for automated audit logging.`,
    bodyEs: `Decoradores útiles incluidos en **@angelitosystems/nest-auth**:
- \`@CurrentUser(field?)\`: Extrae el usuario autenticado o una propiedad específica (\`@CurrentUser('id')\`).
- \`@Public()\`: Exime la ruta de la autenticación obligatoria.
- \`@Roles(...roles)\`: Declara roles requeridos.
- \`@RolesMode('OR' | 'AND')\`: Configura la lógica de evaluación de roles.
- \`@Permissions(...permissions)\`: Declara permisos requeridos.
- \`@Audited(options?)\`: Marca la ruta para auditoría automática.`,
    codeSnippet: {
      language: 'typescript',
      filename: 'decorators-example.ts',
      code: `@Get('profile')
getProfile(@CurrentUser() user: User, @CurrentUser('email') email: string) {
  return { id: user.id, email };
}`,
    },
  },

  'database-overview': {
    titleEn: 'Database Adapters Overview',
    titleEs: 'Visión General de Adaptadores',
    leadEn: 'Decoupled repository interfaces ensuring zero vendor lock-in.',
    leadEs: 'Interfaces de repositorio desacopladas que evitan el acoplamiento con un ORM específico.',
    bodyEn: `The Core library defines the \`AuthDatabaseAdapter\` contract grouping repositories for users, roles, permissions, sessions, tokens, resets, verifications, and audit logs.

Each adapter package implements these interfaces natively using its target ORM.`,
    bodyEs: `La librería Core define el contrato \`AuthDatabaseAdapter\` que agrupa repositorios para usuarios, roles, permisos, sesiones, tokens, recuperaciones y auditoría.

Cada paquete adaptador implementa estas interfaces de forma nativa utilizando su respectivo ORM.`,
    codeSnippet: {
      language: 'typescript',
      filename: 'adapter.interface.ts',
      code: `export interface AuthDatabaseAdapter {
  readonly users: IUserRepository;
  readonly roles: IRoleRepository;
  readonly permissions: IPermissionRepository;
  readonly sessions: ISessionRepository;
  readonly refreshTokens: IRefreshTokenRepository;
  readonly passwordResets: IPasswordResetRepository;
  readonly emailVerifications: IEmailVerificationRepository;
  readonly auditLogs: IAuditLogRepository;
}`,
    },
  },

  prisma: {
    titleEn: 'Prisma Adapter',
    titleEs: 'Adaptador Prisma',
    leadEn: 'Official Prisma adapter for PostgreSQL and MySQL.',
    leadEs: 'Adaptador oficial de Prisma para PostgreSQL y MySQL.',
    bodyEn: `Install \`@angelitosystems/nest-auth-prisma\`. The package includes a ready-to-use \`schema.prisma\` file with index optimizations, foreign keys, and relations.`,
    bodyEs: `Instala \`@angelitosystems/nest-auth-prisma\`. El paquete incluye una plantilla completa de \`schema.prisma\` con índices optimizados y relaciones.`,
    codeSnippet: {
      language: 'typescript',
      filename: 'prisma-setup.ts',
      code: `import { PrismaAuthAdapter } from '@angelitosystems/nest-auth-prisma';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const adapter = new PrismaAuthAdapter(prisma);

AuthModule.forRoot({
  jwt: { secret: process.env.AUTH_JWT_SECRET! },
  adapter,
});`,
    },
  },

  typeorm: {
    titleEn: 'TypeORM Adapter',
    titleEs: 'Adaptador TypeORM',
    leadEn: 'Official TypeORM adapter with pre-configured entities for PostgreSQL and MySQL.',
    leadEs: 'Adaptador oficial de TypeORM con entidades preconfiguradas para PostgreSQL y MySQL.',
    bodyEn: `Install \`@angelitosystems/nest-auth-typeorm\`. Import \`AUTH_ENTITIES\` into your DataSource configuration.`,
    bodyEs: `Instala \`@angelitosystems/nest-auth-typeorm\`. Importa \`AUTH_ENTITIES\` en tu configuración de DataSource.`,
    codeSnippet: {
      language: 'typescript',
      filename: 'typeorm-setup.ts',
      code: `import { AUTH_ENTITIES, TypeOrmAuthAdapter } from '@angelitosystems/nest-auth-typeorm';
import { DataSource } from 'typeorm';

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [...AUTH_ENTITIES],
});

const adapter = new TypeOrmAuthAdapter(dataSource);`,
    },
  },

  sequelize: {
    titleEn: 'Sequelize Adapter',
    titleEs: 'Adaptador Sequelize',
    leadEn: 'Official Sequelize-TypeScript adapter for MySQL and PostgreSQL.',
    leadEs: 'Adaptador oficial de Sequelize-TypeScript para MySQL y PostgreSQL.',
    bodyEn: `Install \`@angelitosystems/nest-auth-sequelize\`. Register \`AUTH_MODELS\` in your Sequelize instance.`,
    bodyEs: `Instala \`@angelitosystems/nest-auth-sequelize\`. Registra \`AUTH_MODELS\` en tu instancia de Sequelize.`,
    codeSnippet: {
      language: 'typescript',
      filename: 'sequelize-setup.ts',
      code: `import { AUTH_MODELS, SequelizeAuthAdapter } from '@angelitosystems/nest-auth-sequelize';
import { Sequelize } from 'sequelize-typescript';

const sequelize = new Sequelize({
  dialect: 'mysql',
  database: 'app_db',
  models: [...AUTH_MODELS],
});

const adapter = new SequelizeAuthAdapter(sequelize);`,
    },
  },

  mongoose: {
    titleEn: 'Mongoose Adapter (MongoDB)',
    titleEs: 'Adaptador Mongoose (MongoDB)',
    leadEn: 'Official Mongoose adapter with automatic schema index synchronization.',
    leadEs: 'Adaptador oficial de Mongoose con auto-sincronización de índices.',
    bodyEn: `Install \`@angelitosystems/nest-auth-mongoose\`. Connect to MongoDB using standard Mongoose connection.`,
    bodyEs: `Instala \`@angelitosystems/nest-auth-mongoose\`. Conéctate a MongoDB utilizando la conexión estándar de Mongoose.`,
    codeSnippet: {
      language: 'typescript',
      filename: 'mongoose-setup.ts',
      code: `import { MongooseAuthAdapter } from '@angelitosystems/nest-auth-mongoose';
import mongoose from 'mongoose';

const connection = await mongoose.createConnection(process.env.MONGODB_URI!).asPromise();
const adapter = new MongooseAuthAdapter(connection);`,
    },
  },

  'audit-logs': {
    titleEn: 'Automated Audit Trail (@Audited)',
    titleEs: 'Pista de Auditoría Automática (@Audited)',
    leadEn: 'Capture security events, user mutations, IP addresses, and state changes.',
    leadEs: 'Registra eventos de seguridad, mutaciones de usuario, direcciones IP y cambios de estado.',
    bodyEn: `The \`@Audited()\` decorator coupled with the \`AuditInterceptor\` logs security-sensitive actions:
- \`LOGIN\`, \`LOGIN_FAILED\`, \`LOGOUT\`
- \`PASSWORD_CHANGED\`, \`PASSWORD_RESET\`, \`EMAIL_VERIFIED\`
- \`USER_CREATED\`, \`USER_UPDATED\`, \`USER_DELETED\`
- \`ROLE_ASSIGNED\`, \`PERMISSION_GRANTED\`

Audit records include the actor, timestamp, route, method, IP, User-Agent, and before/after values (\`old_values\`, \`new_values\`).`,
    bodyEs: `El decorador \`@Audited()\` junto con \`AuditInterceptor\` registra acciones sensibles:
- \`LOGIN\`, \`LOGIN_FAILED\`, \`LOGOUT\`
- \`PASSWORD_CHANGED\`, \`PASSWORD_RESET\`, \`EMAIL_VERIFIED\`
- \`USER_CREATED\`, \`USER_UPDATED\`, \`USER_DELETED\`
- \`ROLE_ASSIGNED\`, \`PERMISSION_GRANTED\`

Los registros contienen actor, fecha, ruta, método, IP, User-Agent y estado antes y después (\`old_values\`, \`new_values\`).`,
    codeSnippet: {
      language: 'typescript',
      filename: 'audit-example.ts',
      code: `import { Controller, Post, Body, UseInterceptors } from '@nestjs/common';
import { Audited, AuditInterceptor } from '@angelitosystems/nest-auth';

@Controller('users')
@UseInterceptors(AuditInterceptor)
export class UsersController {
  @Audited({ action: 'CREATE_USER', entity: 'USER' })
  @Post()
  createUser(@Body() dto: any) {
    return { status: 'created' };
  }
}`,
    },
  },

  events: {
    titleEn: 'Decoupled Domain Events',
    titleEs: 'Eventos de Dominio Desacoplados',
    leadEn: 'Subscribe to authentication lifecycle events in external NestJS modules.',
    leadEs: 'Suscríbete a eventos del ciclo de vida de autenticación en módulos externos de NestJS.',
    bodyEn: `Core emits domain events via \`@nestjs/event-emitter\`:
- \`UserRegisteredEvent\`
- \`UserLoggedInEvent\`
- \`UserLoginFailedEvent\`
- \`PasswordResetEvent\`
- \`EmailVerifiedEvent\`
- \`SessionRevokedEvent\`

External modules can listen without coupling directly to the authentication provider.`,
    bodyEs: `El Core emite eventos de dominio mediante \`@nestjs/event-emitter\`:
- \`UserRegisteredEvent\`
- \`UserLoggedInEvent\`
- \`UserLoginFailedEvent\`
- \`PasswordResetEvent\`
- \`EmailVerifiedEvent\`
- \`SessionRevokedEvent\`

Los módulos externos pueden escuchar estos eventos sin acoplarse al proveedor de autenticación.`,
    codeSnippet: {
      language: 'typescript',
      filename: 'events-listener.ts',
      code: `import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserLoggedInEvent } from '@angelitosystems/nest-auth';

@Injectable()
export class NotificationService {
  @OnEvent('auth.login')
  handleUserLogin(event: UserLoggedInEvent) {
    console.log(\`User logged in: \${event.user.email} from IP \${event.ipAddress}\`);
  }
}`,
    },
  },

  security: {
    titleEn: 'Security Best Practices',
    titleEs: 'Buenas Prácticas de Seguridad',
    leadEn: 'Defense-in-depth principles implemented across the ecosystem.',
    leadEs: 'Principios de seguridad en profundidad implementados en el ecosistema.',
    bodyEn: `Security measures implemented in **@angelitosystems/nest-auth**:
- **Timing-Safe Equality**: Password and token comparisons use \`crypto.timingSafeEqual\` to neutralize side-channel timing attacks.
- **Token Storage Hashing**: Refresh tokens and reset tokens are hashed with SHA-256 before saving to the database.
- **Automatic Session Invalidation**: Password changes revoke all active sessions immediately.
- **Token Reuse Attack Detection**: Revoked refresh tokens trigger an immediate lockdown of all sessions for that account.`,
    bodyEs: `Medidas de seguridad implementadas en **@angelitosystems/nest-auth**:
- **Comparación en Tiempo Constante**: Las comparaciones de contraseñas y tokens utilizan \`crypto.timingSafeEqual\`.
- **Hasheo de Tokens**: Tokens de refresco y recuperación se hashean con SHA-256 antes de guardarse en base de datos.
- **Invalidación Automática de Sesiones**: El cambio de contraseña revoca todas las sesiones activas de inmediato.
- **Detección de Ataques de Reuso**: El uso de un token revocado desencadena el cierre inmediato de todas las sesiones de la cuenta.`,
    codeSnippet: {
      language: 'typescript',
      filename: 'security-practice.ts',
      code: `// Generate a 256-bit cryptographically secure secret:
// $ openssl rand -hex 32
AUTH_JWT_SECRET=c8f5674391...`,
    },
  },

  configuration: {
    titleEn: 'Module Configuration Reference',
    titleEs: 'Referencia de Configuración del Módulo',
    leadEn: 'Full options schema for AuthModule.forRoot() and forRootAsync().',
    leadEs: 'Esquema completo de opciones para AuthModule.forRoot() y forRootAsync().',
    bodyEn: `Comprehensive reference of all \`AuthModuleOptions\` properties:`,
    bodyEs: `Referencia detallada de todas las propiedades de \`AuthModuleOptions\`:`,
    codeSnippet: {
      language: 'typescript',
      filename: 'auth-module-options.ts',
      code: `export interface AuthModuleOptions {
  jwt: {
    secret: string;
    accessTokenExpiresIn?: string | number; // '15m'
    refreshTokenExpiresIn?: string | number; // '7d'
    issuer?: string;
    audience?: string;
  };
  cookies?: {
    enabled: boolean;
    name?: string; // 'access_token'
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: 'lax' | 'strict' | 'none';
    maxAge?: number;
  };
  sessions?: {
    enabled: boolean;
    maxConcurrentSessions?: number;
  };
  features?: {
    refreshTokens?: boolean;
    emailVerification?: boolean;
    passwordReset?: boolean;
    twoFactor?: boolean;
    roles?: boolean;
    permissions?: boolean;
    auditLogs?: boolean;
  };
  adapter: AuthDatabaseAdapter;
  mailProvider?: MailProvider;
  globalGuard?: boolean;
}`,
    },
  },

  'api-reference': {
    titleEn: 'API Reference',
    titleEs: 'Referencia de API',
    leadEn: 'Built-in endpoints, parameters, and return payloads.',
    leadEs: 'Endpoints integrados, parámetros y respuestas devueltas.',
    bodyEn: `Built-in controller endpoints exposed at \`/auth\`:
- \`POST /auth/register\`: Register user and issue tokens.
- \`POST /auth/login\`: Authenticate email/password or request 2FA challenge.
- \`POST /auth/logout\`: Revoke current session and refresh token.
- \`POST /auth/refresh\`: Rotate refresh token and issue new access token.
- \`POST /auth/forgot-password\`: Send single-use reset instructions.
- \`POST /auth/reset-password\`: Confirm new password with token.
- \`POST /auth/verify-email\`: Confirm email verification token.
- \`POST /auth/2fa/setup\`: Generate TOTP secret and recovery codes.
- \`POST /auth/2fa/enable\`: Verify TOTP code and enable 2FA.
- \`POST /auth/2fa/disable\`: Disable 2FA with verified code.
- \`GET  /auth/sessions\`: List active sessions.
- \`DELETE /auth/sessions/:id\`: Revoke specific session.
- \`DELETE /auth/sessions\`: Revoke all other sessions.`,
    bodyEs: `Endpoints del controlador integrado expuestos en \`/auth\`:
- \`POST /auth/register\`: Registra un usuario y emite credenciales.
- \`POST /auth/login\`: Autentica credenciales o solicita desafío 2FA.
- \`POST /auth/logout\`: Revoca sesión actual y refresh token.
- \`POST /auth/refresh\`: Rota refresh token y emite nuevo access token.
- \`POST /auth/forgot-password\`: Envía instrucciones de recuperación.
- \`POST /auth/reset-password\`: Confirma nueva contraseña con token.
- \`POST /auth/verify-email\`: Confirma token de verificación de correo.
- \`POST /auth/2fa/setup\`: Genera secreto TOTP y códigos de recuperación.
- \`POST /auth/2fa/enable\`: Verifica código TOTP y activa 2FA.
- \`POST /auth/2fa/disable\`: Desactiva 2FA con código verificado.
- \`GET  /auth/sessions\`: Lista sesiones activas.
- \`DELETE /auth/sessions/:id\`: Revoca una sesión específica.
- \`DELETE /auth/sessions\`: Revoca todas las demás sesiones.`,
  },

  'cli-reference': {
    titleEn: 'CLI Reference & Doctor',
    titleEs: 'Referencia del CLI y Doctor',
    leadEn: 'All nest-auth-kit commands, options, and diagnostic checks.',
    leadEs: 'Todos los comandos, opciones y verificaciones diagnósticas de nest-auth-kit.',
    bodyEn: `Execute \`npx nest-auth-kit doctor\` to perform an automatic health inspection of your environment.

Checks:
- Node.js runtime compatibility (18+)
- NestJS installation in package.json
- TypeScript configuration (tsconfig.json)
- Detected database ORM
- \`.env\` file presence and \`AUTH_JWT_SECRET\` length
- Database connection URLs`,
    bodyEs: `Ejecuta \`npx nest-auth-kit doctor\` para realizar una inspección de salud automática de tu entorno.

Verificaciones:
- Compatibilidad del runtime de Node.js (18+)
- Instalación de NestJS en package.json
- Configuración de TypeScript (tsconfig.json)
- ORM de base de datos detectado
- Presencia del archivo \`.env\` y longitud de \`AUTH_JWT_SECRET\`
- Cadenas de conexión a base de datos`,
    terminalSnippet: {
      title: 'Terminal · nest-auth-kit doctor',
      command: 'npx nest-auth-kit doctor',
      lines: [
        { type: 'info', text: '🩺 Running nest-auth doctor diagnostics...' },
        { type: 'success', text: '✔ Node.js version compatible (v22.10.5)' },
        { type: 'success', text: '✔ NestJS detected (^10.4.15)' },
        { type: 'success', text: '✔ TypeScript configured (tsconfig.json)' },
        { type: 'success', text: '✔ ORM detected: prisma' },
        { type: 'success', text: '✔ Environment file found (.env)' },
        { type: 'success', text: '✔ AUTH_JWT_SECRET configured' },
        { type: 'info', text: 'Diagnostic complete.' },
      ],
    },
  },

  faq: {
    titleEn: 'Frequently Asked Questions (FAQ)',
    titleEs: 'Preguntas Frecuentes (FAQ)',
    leadEn: 'Answers to common questions about nest-auth.',
    leadEs: 'Respuestas a preguntas habituales sobre nest-auth.',
    bodyEn: `### Can I disable the automatic AuthController and use only services?
Yes. Configure \`controllers: false\` in \`AuthModule.forRoot()\` to supply your own controllers.

### Does @angelitosystems/nest-auth support microservices?
Yes. The services (\`AuthService\`, \`TokenService\`, etc.) can be directly injected into RabbitMQ, Kafka, or gRPC transport handlers.

### How do wildcards work in PermissionsGuard?
A user with permission \`users.*\` automatically satisfies \`@Permissions('users.read')\`, \`@Permissions('users.create')\`, and \`@Permissions('users.delete')\`. Superusers with \`*\` satisfy any permission.`,
    bodyEs: `### ¿Puedo desactivar el controlador automático y usar solo los servicios?
Sí. Configura \`controllers: false\` en \`AuthModule.forRoot()\` para crear tus propios controladores.

### ¿@angelitosystems/nest-auth soporta microservicios?
Sí. Los servicios (\`AuthService\`, \`TokenService\`, etc.) pueden inyectarse directamente en handlers de transporte RabbitMQ, Kafka o gRPC.

### ¿Cómo funcionan los comodines en PermissionsGuard?
Un usuario con el permiso \`users.*\` satisface automáticamente \`@Permissions('users.read')\`, \`@Permissions('users.create')\` y \`@Permissions('users.delete')\`. Los superusuarios con \`*\` satisfacen cualquier permiso.`,
  },

  troubleshooting: {
    titleEn: 'Troubleshooting Guide',
    titleEs: 'Guía de Solución de Problemas',
    leadEn: 'Solutions for common setup and runtime errors.',
    leadEs: 'Soluciones para errores habituales de configuración y ejecución.',
    bodyEn: `### Error: AUTH_JWT_SECRET missing in environment variables
Ensure your \`.env\` file has a valid secret:
\`AUTH_JWT_SECRET=your-random-32-byte-hex-string\`

### Error: Invalid refresh token / Revoked token detected
If a user receives this error, an old or already-used refresh token was submitted. This triggers token reuse attack protection and resets sessions for safety.

### Error: User account is inactive or not found
Ensure the user record has \`is_active: true\` and \`deleted_at: null\` in the database.`,
    bodyEs: `### Error: AUTH_JWT_SECRET missing in environment variables
Asegúrate de que tu archivo \`.env\` contenga un secreto válido:
\`AUTH_JWT_SECRET=tu-clave-secreta-aleatoria-de-32-bytes\`

### Error: Invalid refresh token / Revoked token detected
Este error indica que se presentó un token de refresco ya utilizado previamente. El sistema activa la protección de ataque de reuso y cierra las sesiones por seguridad.

### Error: User account is inactive or not found
Verifica que el registro del usuario tenga \`is_active: true\` y \`deleted_at: null\` en la base de datos.`,
  },
};
