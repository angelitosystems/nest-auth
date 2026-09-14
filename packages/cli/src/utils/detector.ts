import * as fs from 'fs';
import * as path from 'path';

export interface ProjectContext {
  cwd: string;
  hasPackageJson: boolean;
  packageJson: any;
  hasTypeScript: boolean;
  isNestJs: boolean;
  nestVersion?: string;
  nodeVersion: string;
  detectedOrm?: 'prisma' | 'typeorm' | 'sequelize' | 'mongoose';
  hasEnvFile: boolean;
  envVars: Record<string, string>;
  warnings: string[];
  incompatibilities: string[];
}

export function detectProject(cwd = process.cwd()): ProjectContext {
  const packageJsonPath = path.join(cwd, 'package.json');
  const tsconfigPath = path.join(cwd, 'tsconfig.json');
  const envPath = path.join(cwd, '.env');

  const hasPackageJson = fs.existsSync(packageJsonPath);
  let packageJson: any = {};
  if (hasPackageJson) {
    try {
      packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    } catch {
      packageJson = {};
    }
  }

  const hasTypeScript = fs.existsSync(tsconfigPath);
  const dependencies = {
    ...(packageJson.dependencies || {}),
    ...(packageJson.devDependencies || {}),
  };

  const isNestJs = !!(dependencies['@nestjs/core'] || dependencies['@nestjs/common']);
  const nestVersion = dependencies['@nestjs/core'] || dependencies['@nestjs/common'];
  const nodeVersion = process.version;

  let detectedOrm: 'prisma' | 'typeorm' | 'sequelize' | 'mongoose' | undefined;
  if (dependencies['@prisma/client'] || dependencies['prisma'] || fs.existsSync(path.join(cwd, 'prisma'))) {
    detectedOrm = 'prisma';
  } else if (dependencies['typeorm']) {
    detectedOrm = 'typeorm';
  } else if (dependencies['sequelize'] || dependencies['sequelize-typescript']) {
    detectedOrm = 'sequelize';
  } else if (dependencies['mongoose']) {
    detectedOrm = 'mongoose';
  }

  const hasEnvFile = fs.existsSync(envPath);
  const envVars: Record<string, string> = {};
  if (hasEnvFile) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...vals] = trimmed.split('=');
        if (key) {
          envVars[key.trim()] = vals.join('=').trim().replace(/(^"|"$)/g, '');
        }
      }
    }
  }

  const warnings: string[] = [];
  const incompatibilities: string[] = [];

  if (!hasPackageJson) {
    incompatibilities.push('No package.json found in current directory. Please run inside a NestJS project.');
  }

  if (hasPackageJson && !isNestJs) {
    warnings.push('NestJS (@nestjs/core) was not detected in package.json.');
  }

  if (!hasTypeScript) {
    warnings.push('No tsconfig.json found. nest-auth requires TypeScript.');
  }

  return {
    cwd,
    hasPackageJson,
    packageJson,
    hasTypeScript,
    isNestJs,
    nestVersion,
    nodeVersion,
    detectedOrm,
    hasEnvFile,
    envVars,
    warnings,
    incompatibilities,
  };
}
