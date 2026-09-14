export interface NavItem {
  id: string;
  titleEn: string;
  titleEs: string;
  badge?: string;
}

export interface NavSection {
  id: string;
  titleEn: string;
  titleEs: string;
  icon: string;
  items: NavItem[];
}

export const navigationData: NavSection[] = [
  {
    id: 'getting-started',
    titleEn: 'Getting Started',
    titleEs: 'Primeros Pasos',
    icon: 'BookOpen',
    items: [
      { id: 'introduction', titleEn: 'Introduction', titleEs: 'Introducción' },
      { id: 'installation', titleEn: 'Installation', titleEs: 'Instalación' },
      { id: 'quick-start', titleEn: 'Quick Start', titleEs: 'Inicio Rápido', badge: '5 min' },
      { id: 'cli', titleEn: 'CLI Toolkit', titleEs: 'Herramienta CLI' },
    ],
  },
  {
    id: 'authentication',
    titleEn: 'Authentication',
    titleEs: 'Autenticación',
    icon: 'Lock',
    items: [
      { id: 'jwt', titleEn: 'JWT Strategy', titleEs: 'Estrategia JWT' },
      { id: 'cookies', titleEn: 'HttpOnly Cookies', titleEs: 'Cookies HttpOnly' },
      { id: 'sessions', titleEn: 'Session Tracking', titleEs: 'Gestión de Sesiones' },
      { id: 'refresh-tokens', titleEn: 'Refresh Tokens', titleEs: 'Tokens de Refresco' },
      { id: 'passwords', titleEn: 'Password Security', titleEs: 'Seguridad de Contraseñas' },
      { id: 'email-verification', titleEn: 'Email Verification', titleEs: 'Verificación de Email' },
      { id: 'two-factor', titleEn: '2FA TOTP Engine', titleEs: 'Autenticación 2FA' },
    ],
  },
  {
    id: 'authorization',
    titleEn: 'Authorization',
    titleEs: 'Autorización',
    icon: 'Shield',
    items: [
      { id: 'roles', titleEn: 'Roles & RBAC', titleEs: 'Roles y RBAC' },
      { id: 'permissions', titleEn: 'Granular Permissions', titleEs: 'Permisos Granulares' },
      { id: 'guards', titleEn: 'Guards (Auth, Roles, Perms)', titleEs: 'Guards de Seguridad' },
      { id: 'decorators', titleEn: 'Decorators (@CurrentUser)', titleEs: 'Decoradores' },
    ],
  },
  {
    id: 'database',
    titleEn: 'Database & Adapters',
    titleEs: 'Bases de Datos y Adapters',
    icon: 'Database',
    items: [
      { id: 'database-overview', titleEn: 'Architecture Overview', titleEs: 'Visión General' },
      { id: 'prisma', titleEn: 'Prisma (PostgreSQL/MySQL)', titleEs: 'Prisma Adapter' },
      { id: 'typeorm', titleEn: 'TypeORM (Postgres/MySQL)', titleEs: 'TypeORM Adapter' },
      { id: 'sequelize', titleEn: 'Sequelize (MySQL/Postgres)', titleEs: 'Sequelize Adapter' },
      { id: 'mongoose', titleEn: 'Mongoose (MongoDB)', titleEs: 'Mongoose Adapter' },
    ],
  },
  {
    id: 'advanced',
    titleEn: 'Advanced',
    titleEs: 'Avanzado',
    icon: 'Cpu',
    items: [
      { id: 'audit-logs', titleEn: 'Automated Audit Trail', titleEs: 'Auditoría Automática' },
      { id: 'events', titleEn: 'Decoupled Auth Events', titleEs: 'Eventos del Sistema' },
      { id: 'security', titleEn: 'Security Best Practices', titleEs: 'Buenas Prácticas de Seguridad' },
      { id: 'configuration', titleEn: 'Module Configuration', titleEs: 'Configuración de Módulo' },
    ],
  },
  {
    id: 'reference',
    titleEn: 'Reference',
    titleEs: 'Referencia',
    icon: 'FileCode',
    items: [
      { id: 'api-reference', titleEn: 'API Reference', titleEs: 'Referencia de API' },
      { id: 'cli-reference', titleEn: 'CLI Reference', titleEs: 'Referencia de CLI' },
      { id: 'faq', titleEn: 'FAQ', titleEs: 'Preguntas Frecuentes' },
      { id: 'troubleshooting', titleEn: 'Troubleshooting', titleEs: 'Solución de Problemas' },
    ],
  },
];
