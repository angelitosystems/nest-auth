import { execSync } from 'child_process';
import { detectProject } from '../utils/detector';
import { ui } from '../utils/ui';

export async function migrateCommand(
  action: 'run' | 'create' | 'revert' = 'run',
  migrationName?: string,
): Promise<void> {
  const context = detectProject();

  console.log(ui.info(`Running migrations for ORM: ${ui.bold(context.detectedOrm || 'auto-detect')}...`));

  try {
    switch (context.detectedOrm) {
      case 'prisma':
        if (action === 'create' || action === 'run') {
          console.log(ui.info('Executing: npx prisma migrate dev'));
          execSync('npx prisma migrate dev', { stdio: 'inherit', cwd: context.cwd });
        } else {
          console.log(ui.warn('Prisma handles migrations via prisma migrate dev / deploy'));
        }
        break;

      case 'typeorm':
        if (action === 'create') {
          const name = migrationName || 'AuthMigration';
          console.log(ui.info(`Executing: npx typeorm migration:create ./src/migrations/${name}`));
          execSync(`npx typeorm migration:create ./src/migrations/${name}`, {
            stdio: 'inherit',
            cwd: context.cwd,
          });
        } else if (action === 'revert') {
          console.log(ui.info('Executing: npx typeorm migration:revert'));
          execSync('npx typeorm migration:revert', { stdio: 'inherit', cwd: context.cwd });
        } else {
          console.log(ui.info('Executing: npx typeorm migration:run'));
          execSync('npx typeorm migration:run', { stdio: 'inherit', cwd: context.cwd });
        }
        break;

      case 'sequelize':
        if (action === 'create') {
          const name = migrationName || 'create-auth-tables';
          console.log(ui.info(`Executing: npx sequelize-cli migration:generate --name ${name}`));
          execSync(`npx sequelize-cli migration:generate --name ${name}`, {
            stdio: 'inherit',
            cwd: context.cwd,
          });
        } else if (action === 'revert') {
          console.log(ui.info('Executing: npx sequelize-cli db:migrate:undo'));
          execSync('npx sequelize-cli db:migrate:undo', { stdio: 'inherit', cwd: context.cwd });
        } else {
          console.log(ui.info('Executing: npx sequelize-cli db:migrate'));
          execSync('npx sequelize-cli db:migrate', { stdio: 'inherit', cwd: context.cwd });
        }
        break;

      case 'mongoose':
        console.log(ui.info('MongoDB / Mongoose is schemaless. Indexes will be auto-synchronized on application start.'));
        break;

      default:
        console.log(ui.warn('No supported ORM detected. Please install Prisma, TypeORM, or Sequelize first.'));
        break;
    }
  } catch (err: any) {
    console.error(ui.error(`Migration command failed: ${err.message}`));
  }
}
