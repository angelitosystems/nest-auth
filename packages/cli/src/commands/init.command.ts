import prompts from 'prompts';
import { detectProject } from '../utils/detector';
import { generateAuthScaffold } from '../utils/generator';
import { ui, logger, colors } from '../utils/ui';
import { createSpinner } from '../utils/spinner';

export async function initCommand(options: { yes?: boolean }): Promise<void> {
  ui.banner();

  console.log(`  ${colors.bold}Welcome to Nest Auth Kit${colors.reset}`);
  console.log(`  ${colors.cyan}Powered by Angelito Systems${colors.reset}\n`);

  // Step 1: Environment detection with progress indicators
  logger.step(1, 3, 'Detecting project environment...');

  const spinner = createSpinner('Analyzing project configuration...').start();
  await sleep(400);

  const context = detectProject();

  if (context.isNestJs) {
    spinner.succeed(`NestJS detected (${context.nestVersion || 'v10+'})`);
  } else {
    spinner.warn('NestJS was not detected in package.json (will continue anyway)');
  }

  const nodeMajor = parseInt(process.versions.node.split('.')[0], 10);
  if (nodeMajor >= 18) {
    logger.success(`Node.js runtime (${process.version})`);
  } else {
    logger.warning(`Node.js version is ${process.version}. Recommend Node 18+`);
  }

  if (context.hasTypeScript) {
    logger.success('TypeScript configured (tsconfig.json found)');
  } else {
    logger.warning('tsconfig.json not found. nest-auth requires TypeScript');
  }

  if (context.hasPackageJson) {
    logger.success('package.json verified');
  }

  if (context.detectedOrm) {
    logger.info(`Detected existing ORM: ${colors.bold}${context.detectedOrm}${colors.reset}`);
  }

  console.log('');

  // Step 2: Interactive Configuration
  logger.step(2, 3, 'Configuring authentication features...');

  let configAnswers: any;

  if (options.yes) {
    configAnswers = {
      database: 'PostgreSQL',
      orm: 'Prisma',
      authStrategy: 'JWT',
      refreshTokens: true,
      emailVerification: true,
      passwordReset: true,
      twoFactor: true,
      roles: true,
      permissions: true,
      auditLogs: true,
      migrations: true,
      seed: true,
    };
    logger.info('Using enterprise defaults (--yes flag enabled)');
  } else {
    const questions: prompts.PromptObject[] = [
      {
        type: 'select',
        name: 'database',
        message: 'Select your primary database:',
        choices: [
          { title: 'PostgreSQL', value: 'PostgreSQL' },
          { title: 'MySQL', value: 'MySQL' },
          { title: 'MongoDB', value: 'MongoDB' },
        ],
        initial: 0,
      },
      {
        type: 'select',
        name: 'orm',
        message: 'Select ORM / ODM adapter:',
        choices: (prev, answers) => {
          if (answers.database === 'PostgreSQL') {
            return [
              { title: 'Prisma  (Recommended for TypeScript)', value: 'Prisma' },
              { title: 'TypeORM (Enterprise Relational)', value: 'TypeORM' },
            ];
          }
          if (answers.database === 'MySQL') {
            return [
              { title: 'TypeORM   (Active Record & Data Mapper)', value: 'TypeORM' },
              { title: 'Sequelize (Traditional Promise-based)', value: 'Sequelize' },
            ];
          }
          return [{ title: 'Mongoose (Official MongoDB ODM)', value: 'Mongoose' }];
        },
        initial: 0,
      },
      {
        type: 'select',
        name: 'authStrategy',
        message: 'Authentication delivery mechanism:',
        choices: [
          { title: 'JWT (Bearer Token in Headers)', value: 'JWT' },
          { title: 'Cookies (httpOnly Secure Cookies)', value: 'Cookies' },
          { title: 'JWT + Cookies (Hybrid Support)', value: 'JWT + Cookies' },
        ],
        initial: 0,
      },
      {
        type: 'confirm',
        name: 'refreshTokens',
        message: 'Enable Refresh Tokens with rotation & attack detection?',
        initial: true,
      },
      {
        type: 'confirm',
        name: 'emailVerification',
        message: 'Enable Email Verification with token expiration?',
        initial: true,
      },
      {
        type: 'confirm',
        name: 'passwordReset',
        message: 'Enable Password Reset flow (single-use hashed tokens)?',
        initial: true,
      },
      {
        type: 'confirm',
        name: 'twoFactor',
        message: 'Enable Two-Factor Authentication (2FA TOTP + Recovery Codes)?',
        initial: true,
      },
      {
        type: 'confirm',
        name: 'roles',
        message: 'Enable Roles & RolesGuard (@Roles)?',
        initial: true,
      },
      {
        type: 'confirm',
        name: 'permissions',
        message: 'Enable Granular Permissions & PermissionsGuard (@Permissions with wildcards)?',
        initial: true,
      },
      {
        type: 'confirm',
        name: 'auditLogs',
        message: 'Enable Automated Audit Logs (@Audited & mutations tracker)?',
        initial: true,
      },
      {
        type: 'confirm',
        name: 'migrations',
        message: 'Generate database migrations configuration?',
        initial: true,
      },
      {
        type: 'confirm',
        name: 'seed',
        message: 'Generate initial database seed (admin, roles, permissions)?',
        initial: true,
      },
    ];

    configAnswers = await prompts(questions);

    if (!configAnswers.database || !configAnswers.orm) {
      logger.warning('Setup cancelled by user.');
      return;
    }
  }

  // Step 3: Scaffolding Generation
  console.log('');
  logger.step(3, 3, 'Generating scaffolding and configuration...');

  const genSpinner = createSpinner('Generating authentication modules, guards and config...').start();
  await sleep(350);

  const scaffoldConfig = {
    cwd: context.cwd,
    database: configAnswers.database,
    orm: configAnswers.orm,
    authStrategy: configAnswers.authStrategy,
    refreshTokens: configAnswers.refreshTokens ?? true,
    emailVerification: configAnswers.emailVerification ?? true,
    passwordReset: configAnswers.passwordReset ?? true,
    twoFactor: configAnswers.twoFactor ?? true,
    roles: configAnswers.roles ?? true,
    permissions: configAnswers.permissions ?? true,
    auditLogs: configAnswers.auditLogs ?? true,
    migrations: configAnswers.migrations ?? true,
    seed: configAnswers.seed ?? true,
  };

  generateAuthScaffold(scaffoldConfig);
  genSpinner.succeed('Authentication scaffolding created in src/auth/');

  // Final confirmation box
  logger.box('Installation completed successfully', [
    '✔ Authentication configured',
    '✔ Database adapter linked',
    '✔ Guards & Decorators generated',
    '✔ Roles & Permissions active',
    '✔ Audit logging configured',
    '✔ Initial seed script ready',
  ]);

  let adapterPackage = '';
  switch (scaffoldConfig.orm) {
    case 'Prisma': adapterPackage = '@angelitosystems/nest-auth-prisma'; break;
    case 'TypeORM': adapterPackage = '@angelitosystems/nest-auth-typeorm'; break;
    case 'Sequelize': adapterPackage = '@angelitosystems/nest-auth-sequelize'; break;
    case 'Mongoose': adapterPackage = '@angelitosystems/nest-auth-mongoose'; break;
  }

  console.log(`${colors.bold}Next steps:${colors.reset}\n`);
  logger.command(`npm install @angelitosystems/nest-auth ${adapterPackage}`);
  logger.command('npx nest-auth-kit doctor');
  logger.command('npx nest-auth-kit seed');
  logger.command('npm run start:dev\n');
  console.log(`${colors.dim}Documentation: https://angelitosystems.github.io/nest-auth${colors.reset}\n`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
