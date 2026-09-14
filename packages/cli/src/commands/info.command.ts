import { detectProject } from '../utils/detector';
import { ui } from '../utils/ui';

export function infoCommand(): void {
  ui.banner();
  const context = detectProject();

  console.log(ui.bold('📦 Environment & Package Information:\n'));
  console.log(`  ${ui.cyan('Node.js:')}           ${context.nodeVersion}`);
  console.log(`  ${ui.cyan('NestJS:')}            ${context.nestVersion || 'Not detected'}`);
  console.log(`  ${ui.cyan('Detected ORM:')}     ${context.detectedOrm || 'None'}`);
  console.log(`  ${ui.cyan('TypeScript:')}       ${context.hasTypeScript ? 'Yes (tsconfig.json)' : 'No'}`);
  console.log(`  ${ui.cyan('Config (.env):')}     ${context.hasEnvFile ? 'Found' : 'Not found'}`);
  console.log(`  ${ui.cyan('Ecosystem Package:')} @angelitosystems/nest-auth v1.0.0`);
  console.log(`  ${ui.cyan('CLI Toolkit:')}       nest-auth-kit v1.0.0\n`);
}
