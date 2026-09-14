import { Command } from 'commander';
import { initCommand } from './commands/init.command';
import { doctorCommand } from './commands/doctor.command';
import { migrateCommand } from './commands/migrate.command';
import { seedCommand } from './commands/seed.command';
import { generateCommand } from './commands/generate.command';
import { infoCommand } from './commands/info.command';
import { execSync } from 'child_process';
import { detectProject } from './utils/detector';
import { logger, colors } from './utils/logger';

const program = new Command();

program
  .name('nest-auth-kit')
  .description('Official CLI Toolkit for @angelitosystems/nest-auth ecosystem by Angelito Systems')
  .version('1.0.0', '-v, --version', 'Output the current version')
  .helpOption('-h, --help', 'Display help for command')
  .configureHelp({
    subcommandDescription: (cmd) => cmd.description(),
  });

program
  .command('init')
  .description('Initialize authentication ecosystem in your NestJS app')
  .option('-y, --yes', 'Skip interactive questionnaire and use recommended defaults')
  .action(async (options) => {
    await initCommand(options);
  });

program
  .command('install')
  .description('Install authentication dependencies according to detected ORM')
  .action(() => {
    const context = detectProject();
    let adapterPkg = '@angelitosystems/nest-auth-prisma';
    if (context.detectedOrm === 'typeorm') adapterPkg = '@angelitosystems/nest-auth-typeorm';
    if (context.detectedOrm === 'sequelize') adapterPkg = '@angelitosystems/nest-auth-sequelize';
    if (context.detectedOrm === 'mongoose') adapterPkg = '@angelitosystems/nest-auth-mongoose';

    const cmd = `npm install @angelitosystems/nest-auth ${adapterPkg}`;
    logger.info(`Running: ${colors.bold}${cmd}${colors.reset}...`);
    try {
      execSync(cmd, { stdio: 'inherit', cwd: context.cwd });
      logger.success('Dependencies installed successfully.');
    } catch (err: any) {
      logger.error(`Installation failed: ${err.message}`);
    }
  });

program
  .command('generate <schematic> [name]')
  .alias('g')
  .description('Generate authentication resources (guard, decorator, controller, service)')
  .action(async (schematic, name) => {
    await generateCommand(schematic, name);
  });

program
  .command('migrate [action] [name]')
  .description('Run, create, or revert database migrations for the configured adapter')
  .action(async (action, name) => {
    await migrateCommand(action, name);
  });

program
  .command('seed')
  .description('Seed default roles (admin, user), permissions, and initial admin user')
  .action(async () => {
    await seedCommand();
  });

program
  .command('doctor')
  .description('Diagnose project configuration, dependencies, and environment variables')
  .action(async () => {
    await doctorCommand();
  });

program
  .command('info')
  .description('Show project and package information')
  .action(() => {
    infoCommand();
  });

program.parse(process.argv);
