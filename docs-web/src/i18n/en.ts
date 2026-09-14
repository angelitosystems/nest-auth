import { Translations } from './types';

export const en: Translations = {
  common: {
    getStarted: 'Get Started',
    viewOnNpm: 'View on npm',
    githubRepo: 'GitHub',
    documentation: 'Documentation',
    guides: 'Guides',
    apiReference: 'API Reference',
    searchPlaceholder: 'Search documentation...',
    searchShortcut: 'Ctrl K',
    copy: 'Copy',
    copied: 'Copied!',
    builtForNestjs: 'Built for NestJS',
    builtBy: 'Built by Angelito Systems',
    version: 'Version',
    license: 'License',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    tableOfContents: 'On this page',
    next: 'Next',
    previous: 'Previous',
  },
  landing: {
    heroBadge: 'Angelito Systems · Enterprise Ecosystem',
    heroTitle: 'Professional Authentication for NestJS.',
    heroSubtitle:
      'Complete and modular ecosystem of authentication, authorization, roles, permissions, multi-device sessions, 2FA, automated audit logs, and persistence for NestJS microservices and APIs.',
    quickInstall: 'Quick Setup via CLI',
    whyTitle: 'Why @angelitosystems/nest-auth?',
    whySubtitle:
      'Engineered for production resilience with strict separation of concerns, zero database coupling, and defense-in-depth security principles.',
    stats: {
      nativeNestjs: 'NestJS Native',
      nativeNestjsDesc: 'Dynamic modules, guards, decorators & Symbol DI tokens',
      multiOrm: 'Multi-ORM Adapters',
      multiOrmDesc: 'Prisma, TypeORM, Sequelize & Mongoose decoupled contracts',
      securityFirst: 'Defense in Depth',
      securityFirstDesc: 'Constant-time comparison, token reuse attack detection & RFC 6238 2FA',
      zeroVulnerabilities: 'Production Grade',
      zeroVulnerabilitiesDesc: 'Automated audit trail and timing-safe password hashing',
      typedArchitecture: '100% TypeScript',
      typedArchitectureDesc: 'End-to-end strictly typed models, repositories, and guards',
    },
    terminal: {
      title: 'Interactive CLI Scaffold',
      detectedNest: '✔ NestJS detected',
      detectedTs: '✔ TypeScript detected',
      configuredSuccess: 'Installation completed successfully',
      readyToStart: 'Ready to build secure NestJS backends!',
    },
    matrixTitle: 'Decoupled Adapter Ecosystem',
    matrixSubtitle:
      'Install only what you need. Zero bloat, zero unnecessary ORM dependencies.',
    ctaTitle: 'Ready to bootstrap enterprise authentication in minutes?',
    ctaSubtitle:
      'Run npx nest-auth-kit init to configure your entire auth architecture with guided interactive prompts.',
  },
  features: [
    {
      id: 'dual-auth',
      title: 'Dual Token Delivery (JWT + Cookies)',
      description:
        'Seamless support for Bearer headers, httpOnly secure cookies, or hybrid delivery with automatic rotation and CSRF protection.',
    },
    {
      id: 'rbac-permissions',
      title: 'RBAC & Wildcard Permissions',
      description:
        'Declarative @Roles("admin") with OR/AND logic, and granular @Permissions("users.create") supporting wildcards like users.* and *.',
    },
    {
      id: 'sessions',
      title: 'Multi-Device Session Tracking',
      description:
        'Track client IP, device, User-Agent, and last activity. Remotely revoke specific devices or terminate sessions on password changes.',
    },
    {
      id: 'two-factor',
      title: 'Two-Factor Authentication (2FA)',
      description:
        'RFC 6238 compliant TOTP engine with otpauth QR codes and 8 single-use cryptographically hashed recovery codes.',
    },
    {
      id: 'audit-trail',
      title: 'Automated Mutation Audit Trail',
      description:
        '@Audited() decorator and interceptor capture entities, route, method, pre/post changes (old_values, new_values), and IP.',
    },
    {
      id: 'adapters',
      title: 'Universal Database Adapters',
      description:
        'First-class adapters for Prisma (PostgreSQL/MySQL), TypeORM (Postgres/MySQL), Sequelize (MySQL/Postgres), and Mongoose (MongoDB).',
    },
  ],
};
