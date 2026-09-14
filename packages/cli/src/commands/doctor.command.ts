import { detectProject } from '../utils/detector';
import { ui } from '../utils/ui';

export async function doctorCommand(): Promise<void> {
  ui.banner();
  console.log(ui.bold('🩺 Running nest-auth doctor diagnostics...\n'));

  const context = detectProject();

  // 1. Node.js check
  const nodeMajor = parseInt(process.versions.node.split('.')[0], 10);
  if (nodeMajor >= 18) {
    ui.success(`Node.js version compatible (${process.version})`);
  } else {
    ui.error(`Node.js version outdated (${process.version}). Node 18+ is required.`);
  }

  // 2. NestJS check
  if (context.isNestJs) {
    ui.success(`NestJS detected (${context.nestVersion || 'unknown version'})`);
  } else {
    ui.warn(`NestJS not found in package.json dependencies`);
  }

  // 3. TypeScript check
  if (context.hasTypeScript) {
    ui.success(`TypeScript configured (tsconfig.json present)`);
  } else {
    ui.error(`TypeScript not configured (tsconfig.json missing)`);
  }

  // 4. ORM check
  if (context.detectedOrm) {
    ui.success(`ORM detected: ${context.detectedOrm}`);
  } else {
    ui.warn(`No supported ORM detected (Prisma, TypeORM, Sequelize, or Mongoose)`);
  }

  // 5. Environment check
  if (context.hasEnvFile) {
    ui.success(`Environment file found (.env)`);
  } else {
    ui.warn(`.env file missing in project root`);
  }

  // 6. JWT Secret check
  if (context.envVars['AUTH_JWT_SECRET']) {
    ui.success(`AUTH_JWT_SECRET configured`);
  } else {
    ui.error(`AUTH_JWT_SECRET missing in environment variables`);
  }

  // 7. Database URL check
  if (context.envVars['DATABASE_URL'] || context.envVars['MONGODB_URI']) {
    ui.success(`Database connection string configured`);
  } else {
    ui.warn(`DATABASE_URL / MONGODB_URI not found in .env`);
  }

  // 8. Seed credentials check
  if (context.envVars['AUTH_SEED_ADMIN_EMAIL'] && context.envVars['AUTH_SEED_ADMIN_PASSWORD']) {
    ui.success(`Initial admin seed credentials configured`);
  } else {
    ui.info(`AUTH_SEED_ADMIN_EMAIL / PASSWORD not set (default will be used for seed)`);
  }

  console.log('\n' + ui.bold('Diagnostic complete.\n'));
}
