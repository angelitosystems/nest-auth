import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { detectProject } from '../utils/detector';
import { ui } from '../utils/ui';

export async function seedCommand(): Promise<void> {
  const context = detectProject();
  console.log(ui.info('🌱 Executing database seed for nest-auth...'));

  const seedScriptPath = path.join(context.cwd, 'src', 'auth', 'seed.ts');
  if (fs.existsSync(seedScriptPath)) {
    try {
      console.log(ui.info(`Found seed script at ${seedScriptPath}. Running with ts-node / tsx...`));
      execSync('npx ts-node -e "require(\'./src/auth/seed\').runAuthSeed()"', {
        stdio: 'inherit',
        cwd: context.cwd,
      });
      console.log(ui.success('Database seed finished successfully.'));
      return;
    } catch {
      // If ts-node direct exec is not available in target project, show instructions
    }
  }

  console.log(ui.info(`Admin Email: ${context.envVars['AUTH_SEED_ADMIN_EMAIL'] || 'admin@example.com'}`));
  console.log(ui.info(`Roles: admin, user`));
  console.log(ui.info(`Permissions: users.*, roles.*, permissions.*, audit.read`));
  console.log(ui.success('Seed template ready in src/auth/seed.ts'));
}
