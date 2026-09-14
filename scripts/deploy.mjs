#!/usr/bin/env node

/**
 * Script interactivo y modular de despliegue y publicación en NPM
 * para el ecosistema @angelitosystems/nest-auth y nest-auth-kit.
 *
 * Desarrollado para: Angelito Systems
 *
 * Soporta:
 *  - Despliegue de TODOS los paquetes en orden topológico de dependencias (Core primero, luego adaptadores y CLI).
 *  - Despliegue INDEPENDIENTE de cualquier paquete individual.
 *  - Verificación de dependencias publicadas en NPM.
 *  - Soporte 2FA OTP interactivo o por parámetro.
 *  - Modo --dry-run para simulación segura.
 *  - Sincronización automática de LICENSE y metadatos.
 *
 * Uso:
 *   npm run deploy
 *   npm run deploy:all
 *   npm run deploy:core
 *   npm run deploy:cli
 *   node scripts/deploy.mjs --package=core [--otp=123456] [--dry-run] [--skip-tests]
 */

import { execSync, spawnSync } from 'node:child_process';
import * as readline from 'node:readline';
import * as fs from 'node:fs';
import * as path from 'node:path';

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  brightGreen: '\x1b[92m',
  brightCyan: '\x1b[96m',
};

function log(msg, color = colors.reset) {
  console.log(`${color}${msg}${colors.reset}`);
}

function printBanner() {
  console.log(`
${colors.brightCyan}${colors.bold}    _                    _ _ _          
   / \\   _ __   __ _  ___| (_) |_ ___   
  / _ \\ | '_ \\ / _\` |/ _ \\ | | __/ _ \\  
 / ___ \\| | | | (_| |  __/ | | || (_) | 
/_/   \\_\\_| |_|\\__, |\\___|_|_|\\__\\___/  
               |___/                    ${colors.reset}
       ${colors.bold}Angelito Systems · NPM Deployment Engine${colors.reset}
       ${colors.dim}Ecosistema NestJS Auth · Publicación Independiente y Modular${colors.reset}
`);
}

// Definición de paquetes y su orden de dependencia topológica
const PACKAGES = [
  {
    id: 'core',
    name: '@angelitosystems/nest-auth',
    dir: 'packages/core',
    description: 'Core Auth Ecosystem (JWT, RBAC, Sessions, 2FA, Audit)',
    dependsOn: [],
    priority: 1,
  },
  {
    id: 'prisma',
    name: '@angelitosystems/nest-auth-prisma',
    dir: 'packages/prisma',
    description: 'Prisma ORM Database Adapter',
    dependsOn: ['@angelitosystems/nest-auth'],
    priority: 2,
  },
  {
    id: 'typeorm',
    name: '@angelitosystems/nest-auth-typeorm',
    dir: 'packages/typeorm',
    description: 'TypeORM Database Adapter (PostgreSQL / MySQL)',
    dependsOn: ['@angelitosystems/nest-auth'],
    priority: 3,
  },
  {
    id: 'sequelize',
    name: '@angelitosystems/nest-auth-sequelize',
    dir: 'packages/sequelize',
    description: 'Sequelize Database Adapter (MySQL / PostgreSQL)',
    dependsOn: ['@angelitosystems/nest-auth'],
    priority: 4,
  },
  {
    id: 'mongoose',
    name: '@angelitosystems/nest-auth-mongoose',
    dir: 'packages/mongoose',
    description: 'Mongoose Database Adapter (MongoDB)',
    dependsOn: ['@angelitosystems/nest-auth'],
    priority: 5,
  },
  {
    id: 'cli',
    name: 'nest-auth-kit',
    dir: 'packages/cli',
    description: 'Official CLI Toolkit & Scaffolding Engine',
    dependsOn: [],
    priority: 6,
  },
];

async function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function runStep(title, command, options = {}) {
  console.log(`\n${colors.cyan}▶ ${title}${colors.reset}`);
  console.log(`${colors.gray}$ ${command}${colors.reset}`);
  try {
    execSync(command, { stdio: 'inherit', ...options });
    console.log(`${colors.green}✔ ${title} completado con éxito.${colors.reset}`);
  } catch (error) {
    console.error(`\n${colors.red}✖ Falló el paso: ${title}${colors.reset}`);
    process.exit(1);
  }
}

function isPackagePublishedOnNpm(packageName) {
  try {
    const output = execSync(`npm view ${packageName} version`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    return output.length > 0;
  } catch {
    return false;
  }
}

function ensureLicense(pkgDir) {
  const rootLicense = path.resolve('LICENSE');
  const targetLicense = path.join(pkgDir, 'LICENSE');
  if (fs.existsSync(rootLicense) && !fs.existsSync(targetLicense)) {
    fs.copyFileSync(rootLicense, targetLicense);
  }
}

async function publishSinglePackage(pkg, options, npmUser) {
  const pkgDir = path.resolve(pkg.dir);
  const pkgJsonPath = path.join(pkgDir, 'package.json');

  if (!fs.existsSync(pkgJsonPath)) {
    log(`✖ No se encontró ${pkgJsonPath}`, colors.red);
    return false;
  }

  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
  const version = pkgJson.version;

  log(`\n${colors.brightCyan}=======================================================${colors.reset}`);
  log(` 📦 Desplegando: ${colors.bold}${pkg.name}@${version}${colors.reset}`, colors.brightCyan);
  log(` 📁 Directorio: ${pkg.dir}`, colors.gray);
  log(` 📝 Descripción: ${pkg.description}`, colors.gray);
  log(`${colors.brightCyan}=======================================================${colors.reset}`);

  // Asegurar LICENSE en el paquete
  ensureLicense(pkgDir);

  // 1. Verificación de dependencias externas en NPM
  if (pkg.dependsOn.length > 0 && !options.isBatch) {
    for (const dep of pkg.dependsOn) {
      log(`🔍 Verificando dependencia base requerida '${dep}' en NPM...`, colors.gray);
      const isDepPublished = isPackagePublishedOnNpm(dep);
      if (!isDepPublished) {
        log(`\n${colors.yellow}⚠ ADVERTENCIA:${colors.reset} El paquete '${pkg.name}' depende de '${dep}'.`, colors.yellow);
        log(`No se detectó '${dep}' publicado en el registro público de NPM.`, colors.yellow);
        log(`Si los usuarios instalan '${pkg.name}', requerirán '${dep}'.`, colors.yellow);
        const proceed = await askQuestion(`¿Deseas continuar con el despliegue de '${pkg.name}' de todas formas? (s/N): `);
        if (!['s', 'si', 'y', 'yes'].includes(proceed.toLowerCase())) {
          log(`Despliegue de ${pkg.name} omitido por el usuario.`, colors.yellow);
          return false;
        }
      } else {
        log(`✔ Dependencia '${dep}' encontrada en NPM.`, colors.green);
      }
    }
  }

  // 2. Compilar paquete
  runStep(`Compilando ${pkg.name}`, `npm run build --workspace=${pkg.name}`);

  // 3. Dry-run de empaquetado
  log(`\n${colors.cyan}▶ Verificando empaquetado (dry-run) de ${pkg.name}...${colors.reset}`);
  try {
    execSync('npm pack --dry-run', { cwd: pkgDir, stdio: 'inherit' });
    log(`✔ Empaquetado de ${pkg.name} verificado correctamente.`, colors.green);
  } catch {
    log(`✖ Error en verificación de empaquetado para ${pkg.name}.`, colors.red);
    return false;
  }

  if (options.dryRun) {
    log(`\n${colors.yellow}🔍 MODO DRY-RUN: ${pkg.name}@${version} está listo para publicarse. No se realizaron cambios en NPM.${colors.reset}`);
    return true;
  }

  // 4. Confirmación individual si no es batch automático
  if (!options.isBatch && !options.yes) {
    log(`\n${colors.yellow}-------------------------------------------------------${colors.reset}`);
    log(`¿Confirmas la publicación de ${colors.bold}${pkg.name}@${version}${colors.reset}${colors.yellow} en NPM?`, colors.yellow);
    log(`Acceso: ${colors.green}public${colors.reset} | Usuario: ${colors.green}${npmUser}${colors.reset}`);
    log(`${colors.yellow}-------------------------------------------------------${colors.reset}`);
    const confirm = await askQuestion(`Escribe 'si' o 'y' para publicar: `);
    if (!['si', 's', 'y', 'yes'].includes(confirm.toLowerCase())) {
      log(`Publicación de ${pkg.name} cancelada.`, colors.yellow);
      return false;
    }
  }

  // 5. Publicación en NPM con reintento interactivo de 2FA OTP
  let currentOtp = options.otp;
  let published = false;
  let attempts = 0;
  const maxAttempts = 3;

  while (!published && attempts < maxAttempts) {
    attempts++;
    const publishArgs = ['publish', '--access', 'public', `--tag`, options.tag || 'latest'];
    if (currentOtp) {
      publishArgs.push(`--otp=${currentOtp}`);
    }

    log(`\n${colors.cyan}▶ Ejecutando: npm ${publishArgs.join(' ')} (en ${pkg.dir})...${colors.reset}`);
    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const result = spawnSync(npmCmd, publishArgs, {
      cwd: pkgDir,
      stdio: 'inherit',
    });

    if (result.status === 0) {
      published = true;
      log(`\n${colors.green}✔ ¡${pkg.name}@${version} publicado exitosamente en NPM!${colors.reset}`, colors.brightGreen);
      log(`🔗 URL: https://www.npmjs.com/package/${pkg.name}`, colors.cyan);
    } else {
      log(`\n${colors.red}✖ Error al publicar ${pkg.name} (código ${result.status}).${colors.reset}`, colors.red);
      log(`Si el error fue debido a 2FA (código OTP ausente o expirado), ingrésalo a continuación:`, colors.yellow);
      const inputOtp = await askQuestion(`Ingresa el código 2FA / TOTP (o presiona Enter para abortar): `);
      if (inputOtp && inputOtp.trim().length > 0) {
        currentOtp = inputOtp.trim();
        // Guardar para los siguientes paquetes en caso de batch
        options.otp = currentOtp;
      } else {
        break;
      }
    }
  }

  return published;
}

async function main() {
  printBanner();

  // 1. Parsear argumentos CLI
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    skipTests: args.includes('--skip-tests'),
    yes: args.includes('-y') || args.includes('--yes'),
    all: args.includes('--all'),
    otp: args.find((a) => a.startsWith('--otp='))?.split('=')[1] || '',
    tag: args.find((a) => a.startsWith('--tag='))?.split('=')[1] || 'latest',
    packageArg: args.find((a) => a.startsWith('--package='))?.split('=')[1] || '',
  };

  // 2. Verificar sesión de NPM
  log(`▶ Verificando sesión en npm...`, colors.cyan);
  let npmUser = '';
  try {
    npmUser = execSync('npm whoami', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
    log(`✔ Sesión activa en npm como: ${colors.bold}${colors.brightGreen}${npmUser}${colors.reset}`, colors.green);
  } catch {
    log(`✖ No has iniciado sesión en npm.`, colors.red);
    log(`Por favor ejecuta primero en tu consola:`, colors.yellow);
    log(`  npm login`, colors.brightCyan);
    process.exit(1);
  }

  // 3. Determinar qué paquetes desplegar
  let targetPackages = [];

  if (options.all) {
    targetPackages = [...PACKAGES].sort((a, b) => a.priority - b.priority);
  } else if (options.packageArg) {
    const query = options.packageArg.toLowerCase().trim();
    const found = PACKAGES.find((p) => p.id === query || p.name === query || p.dir.endsWith(query));
    if (!found) {
      log(`✖ Paquete no reconocido: '${options.packageArg}'`, colors.red);
      log(`Paquetes disponibles: ${PACKAGES.map((p) => p.id).join(', ')}`, colors.yellow);
      process.exit(1);
    }
    targetPackages = [found];
  } else {
    // Menú Interactivo
    log(`\n${colors.bold}Selecciona qué paquete(s) deseas desplegar en NPM:${colors.reset}\n`);
    log(`  [1] 🚀 Todos los paquetes en orden de dependencias (Core -> Adaptadores -> CLI)`, colors.brightCyan);
    PACKAGES.forEach((pkg, index) => {
      const depBadge = pkg.dependsOn.length > 0 ? `${colors.yellow}[depende de core]${colors.reset}` : `${colors.green}[independiente]${colors.reset}`;
      log(`  [${index + 2}] ${colors.bold}${pkg.name}${colors.reset} (${pkg.id}) ${depBadge}`);
      log(`      ${colors.dim}${pkg.description}${colors.reset}`);
    });
    log(`  [0] Cancelar\n`, colors.gray);

    const selection = await askQuestion(`Ingresa el número de tu opción (0-${PACKAGES.length + 1}): `);

    if (selection === '1') {
      targetPackages = [...PACKAGES].sort((a, b) => a.priority - b.priority);
      options.isBatch = true;
    } else if (selection === '0' || !selection) {
      log(`Despliegue cancelado.`, colors.yellow);
      process.exit(0);
    } else {
      const idx = parseInt(selection, 10) - 2;
      if (idx >= 0 && idx < PACKAGES.length) {
        targetPackages = [PACKAGES[idx]];
      } else {
        log(`Opción inválida.`, colors.red);
        process.exit(1);
      }
    }
  }

  // 4. Quality Gates Globales (si no es dry-run y no se omite)
  log(`\n${colors.bold}--- Quality Gates & Verificación de Monorepo ---${colors.reset}`);

  if (!options.skipTests) {
    runStep('Suite de pruebas unitarias', 'npm test');
  } else {
    log('⚠ Omitiendo tests unitarios por argumento --skip-tests', colors.yellow);
  }

  runStep('Compilación global de workspaces', 'npm run build');

  // 5. Confirmación si se despliegan todos
  if (targetPackages.length > 1 && !options.yes && !options.dryRun) {
    log(`\n${colors.yellow}=======================================================${colors.reset}`);
    log(`Se publicarán ${colors.bold}${targetPackages.length} paquetes${colors.reset}${colors.yellow} en NPM en el siguiente orden:${colors.reset}`);
    targetPackages.forEach((p, i) => {
      log(`  ${i + 1}. ${colors.bold}${p.name}${colors.reset} (${p.dir})`);
    });
    log(`Usuario NPM: ${colors.green}${npmUser}${colors.reset}`);
    log(`${colors.yellow}=======================================================${colors.reset}`);

    const proceed = await askQuestion(`¿Deseas continuar con la publicación en serie? (si/no): `);
    if (!['si', 's', 'y', 'yes'].includes(proceed.toLowerCase())) {
      log(`Operación cancelada por el usuario.`, colors.yellow);
      process.exit(0);
    }
  }

  // 6. Ejecutar publicaciones individuales
  const results = [];
  for (const pkg of targetPackages) {
    const success = await publishSinglePackage(pkg, options, npmUser);
    results.push({ pkg, success });
    if (!success && targetPackages.length > 1) {
      const cont = await askQuestion(`\n¿Deseas continuar con el siguiente paquete a pesar del error anterior? (s/N): `);
      if (!['s', 'si', 'y', 'yes'].includes(cont.toLowerCase())) {
        break;
      }
    }
  }

  // 7. Reporte final
  log(`\n${colors.brightCyan}=======================================================${colors.reset}`);
  log(` 🏁 RESUMEN DEL DESPLIEGUE EN NPM`, colors.bold + colors.brightCyan);
  log(`${colors.brightCyan}=======================================================${colors.reset}`);

  for (const res of results) {
    const status = res.success
      ? `${colors.green}✔ PUBLICADO${colors.reset}`
      : `${colors.red}✖ NO PUBLICADO${colors.reset}`;
    log(`• ${res.pkg.name.padEnd(35)} ${status}`);
    if (res.success && !options.dryRun) {
      log(`  🔗 https://www.npmjs.com/package/${res.pkg.name}`, colors.cyan);
    }
  }

  log(`\n${colors.green}Proceso finalizado. Gracias por usar las soluciones de Angelito Systems.${colors.reset}\n`);
}

main().catch((err) => {
  console.error('\nError fatal durante el despliegue:', err);
  process.exit(1);
});
