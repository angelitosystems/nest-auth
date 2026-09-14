import {
  DynamicModule,
  Global,
  Module,
  Provider,
} from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import {
  AUTH_DATABASE_ADAPTER,
  AUTH_MAIL_PROVIDER,
  AUTH_MODULE_OPTIONS,
} from './constants/auth.constants';
import {
  AuthModuleAsyncOptions,
  AuthModuleOptions,
} from './interfaces/auth-module-options.interface';
import { AuthService } from './services/auth.service';
import { TokenService } from './security/token.service';
import { PasswordService } from './security/password.service';
import { TwoFactorService } from './security/two-factor.service';
import { SessionService } from './services/session.service';
import { AuditService } from './services/audit.service';
import { MailService } from './services/mail.service';
import { ConsoleMailProvider } from './mail/console-mail.provider';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { AuditInterceptor } from './interceptors/audit.interceptor';
import { AuthController } from './controllers/auth.controller';

@Global()
@Module({})
export class AuthModule {
  static forRoot(options: AuthModuleOptions): DynamicModule {
    const providers: Provider[] = [
      {
        provide: AUTH_MODULE_OPTIONS,
        useValue: options,
      },
      {
        provide: AUTH_DATABASE_ADAPTER,
        useValue: options.adapter,
      },
      {
        provide: AUTH_MAIL_PROVIDER,
        useValue: options.mailProvider || new ConsoleMailProvider(),
      },
      AuthService,
      TokenService,
      PasswordService,
      TwoFactorService,
      SessionService,
      AuditService,
      MailService,
      AuthGuard,
      RolesGuard,
      PermissionsGuard,
      AuditInterceptor,
    ];

    if (options.globalGuard) {
      providers.push({
        provide: APP_GUARD,
        useClass: AuthGuard,
      });
    }

    const controllers =
      options.controllers === false ||
      (typeof options.controllers === 'object' && options.controllers.auth === false)
        ? []
        : [AuthController];

    return {
      module: AuthModule,
      imports: [EventEmitterModule.forRoot()],
      providers,
      controllers,
      exports: [
        AuthService,
        TokenService,
        PasswordService,
        TwoFactorService,
        SessionService,
        AuditService,
        MailService,
        AuthGuard,
        RolesGuard,
        PermissionsGuard,
        AuditInterceptor,
        AUTH_MODULE_OPTIONS,
        AUTH_DATABASE_ADAPTER,
      ],
    };
  }

  static forRootAsync(options: AuthModuleAsyncOptions): DynamicModule {
    const asyncProviders: Provider[] = [
      {
        provide: AUTH_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      },
      {
        provide: AUTH_DATABASE_ADAPTER,
        useFactory: (opts: AuthModuleOptions) => opts.adapter,
        inject: [AUTH_MODULE_OPTIONS],
      },
      {
        provide: AUTH_MAIL_PROVIDER,
        useFactory: (opts: AuthModuleOptions) => opts.mailProvider || new ConsoleMailProvider(),
        inject: [AUTH_MODULE_OPTIONS],
      },
      AuthService,
      TokenService,
      PasswordService,
      TwoFactorService,
      SessionService,
      AuditService,
      MailService,
      AuthGuard,
      RolesGuard,
      PermissionsGuard,
      AuditInterceptor,
    ];

    return {
      module: AuthModule,
      imports: [...(options.imports || []), EventEmitterModule.forRoot()],
      providers: asyncProviders,
      controllers: [AuthController],
      exports: [
        AuthService,
        TokenService,
        PasswordService,
        TwoFactorService,
        SessionService,
        AuditService,
        MailService,
        AuthGuard,
        RolesGuard,
        PermissionsGuard,
        AuditInterceptor,
        AUTH_MODULE_OPTIONS,
        AUTH_DATABASE_ADAPTER,
      ],
    };
  }
}
