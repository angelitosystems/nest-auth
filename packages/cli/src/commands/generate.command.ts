import * as fs from 'fs';
import * as path from 'path';
import { ui } from '../utils/ui';

export async function generateCommand(
  schematic: string,
  name?: string,
  options?: any,
): Promise<void> {
  const cwd = process.cwd();
  const authDir = path.join(cwd, 'src', 'auth');
  fs.mkdirSync(authDir, { recursive: true });

  const targetName = (name || 'custom').toLowerCase();

  switch (schematic) {
    case 'guard': {
      const guardPath = path.join(authDir, `${targetName}.guard.ts`);
      const content = `import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class ${capitalize(targetName)}Guard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return !!user;
  }
}
`;
      fs.writeFileSync(guardPath, content);
      console.log(ui.success(`Created guard: src/auth/${targetName}.guard.ts`));
      break;
    }

    case 'decorator': {
      const decPath = path.join(authDir, `${targetName}.decorator.ts`);
      const content = `import { SetMetadata } from '@nestjs/common';

export const ${capitalize(targetName)} = (...args: string[]) => SetMetadata('${targetName}', args);
`;
      fs.writeFileSync(decPath, content);
      console.log(ui.success(`Created decorator: src/auth/${targetName}.decorator.ts`));
      break;
    }

    case 'controller': {
      const ctrlPath = path.join(authDir, `${targetName}.controller.ts`);
      const content = `import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard, CurrentUser } from '@angelitosystems/nest-auth';

@Controller('${targetName}')
export class ${capitalize(targetName)}Controller {
  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    return user;
  }
}
`;
      fs.writeFileSync(ctrlPath, content);
      console.log(ui.success(`Created controller: src/auth/${targetName}.controller.ts`));
      break;
    }

    case 'service': {
      const srvPath = path.join(authDir, `${targetName}.service.ts`);
      const content = `import { Injectable } from '@nestjs/common';

@Injectable()
export class ${capitalize(targetName)}Service {
  // Custom business logic extending auth functionality
}
`;
      fs.writeFileSync(srvPath, content);
      console.log(ui.success(`Created service: src/auth/${targetName}.service.ts`));
      break;
    }

    default:
      console.log(ui.warn(`Unknown schematic: "${schematic}". Available: guard, decorator, controller, service`));
      break;
  }
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
