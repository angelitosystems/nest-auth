import { Translations } from './types';

export const es: Translations = {
  common: {
    getStarted: 'Comenzar',
    viewOnNpm: 'Ver en npm',
    githubRepo: 'GitHub',
    documentation: 'Documentación',
    guides: 'Guías',
    apiReference: 'Referencia de API',
    searchPlaceholder: 'Buscar en la documentación...',
    searchShortcut: 'Ctrl K',
    copy: 'Copiar',
    copied: '¡Copiado!',
    builtForNestjs: 'Desarrollado para NestJS',
    builtBy: 'Creado por Angelito Systems',
    version: 'Versión',
    license: 'Licencia',
    light: 'Claro',
    dark: 'Oscuro',
    system: 'Sistema',
    tableOfContents: 'En esta página',
    next: 'Siguiente',
    previous: 'Anterior',
  },
  landing: {
    heroBadge: 'Angelito Systems · Ecosistema Empresarial',
    heroTitle: 'Autenticación Profesional para NestJS.',
    heroSubtitle:
      'Ecosistema completo y modular de autenticación, autorización, roles, permisos, sesiones multi-dispositivo, 2FA, auditoría automática y persistencia para microservicios y APIs NestJS.',
    quickInstall: 'Configuración Rápida con CLI',
    whyTitle: '¿Por qué @angelitosystems/nest-auth?',
    whySubtitle:
      'Diseñado para producción con estricta separación de responsabilidades, desacoplamiento de base de datos y principios de seguridad en profundidad.',
    stats: {
      nativeNestjs: 'Nativo de NestJS',
      nativeNestjsDesc: 'Módulos dinámicos, guards, decoradores y tokens Symbol DI',
      multiOrm: 'Múltiples ORMs',
      multiOrmDesc: 'Contratos desacoplados para Prisma, TypeORM, Sequelize y Mongoose',
      securityFirst: 'Seguridad en Profundidad',
      securityFirstDesc: 'Comparación timing-safe, detección de reuso de tokens y 2FA RFC 6238',
      zeroVulnerabilities: 'Calidad Empresarial',
      zeroVulnerabilitiesDesc: 'Pista de auditoría automática y hash seguro de contraseñas',
      typedArchitecture: '100% TypeScript',
      typedArchitectureDesc: 'Modelos, repositorios y guards con tipado estricto extremo a extremo',
    },
    terminal: {
      title: 'Scaffolding Interactivo con CLI',
      detectedNest: '✔ NestJS detectado',
      detectedTs: '✔ TypeScript detectado',
      configuredSuccess: 'Instalación completada con éxito',
      readyToStart: '¡Listo para desarrollar backends seguros con NestJS!',
    },
    matrixTitle: 'Ecosistema de Adaptadores Desacoplados',
    matrixSubtitle:
      'Instala solo lo que necesitas. Cero dependencias innecesarias de bases de datos.',
    ctaTitle: '¿Listo para implementar autenticación empresarial en minutos?',
    ctaSubtitle:
      'Ejecuta npx nest-auth-kit init para configurar toda tu arquitectura mediante preguntas guiadas interactivas.',
  },
  features: [
    {
      id: 'dual-auth',
      title: 'Doble Estrategia (JWT + Cookies)',
      description:
        'Soporte fluido para Bearer tokens, cookies httpOnly seguras o modo híbrido con rotación automática y mitigación CSRF.',
    },
    {
      id: 'rbac-permissions',
      title: 'RBAC y Permisos con Wildcards',
      description:
        'Control declarativo con @Roles("admin") en modo OR/AND y permisos granulares con comodines (@Permissions("users.*")).',
    },
    {
      id: 'sessions',
      title: 'Sesiones Multi-Dispositivo',
      description:
        'Rastreo de IP, dispositivo, User-Agent y última actividad con revocación remota de dispositivos específicos o globales.',
    },
    {
      id: 'two-factor',
      title: 'Autenticación en Dos Pasos (2FA)',
      description:
        'Motor TOTP compatible con RFC 6238, códigos QR otpauth y 8 códigos de recuperación hasheados de un solo uso.',
    },
    {
      id: 'audit-trail',
      title: 'Pista de Auditoría Automática',
      description:
        'Decorador @Audited() e interceptor que registran entidades, ruta, método, cambios (old_values, new_values) e IP.',
    },
    {
      id: 'adapters',
      title: 'Adaptadores Universales de BD',
      description:
        'Adaptadores de primer nivel para Prisma (PostgreSQL/MySQL), TypeORM (Postgres/MySQL), Sequelize (MySQL/Postgres) y Mongoose (MongoDB).',
    },
  ],
};
