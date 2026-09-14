import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { SessionService } from '../services/session.service';
import { Public } from '../decorators/public.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AuthGuard } from '../guards/auth.guard';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
  ResendVerificationDto,
  EnableTwoFactorDto,
  DisableTwoFactorDto,
} from '../dto/auth.dto';
import { AUTH_MODULE_OPTIONS, DEFAULT_COOKIE_NAME } from '../constants/auth.constants';
import { AuthModuleOptions } from '../interfaces/auth-module-options.interface';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
    @Inject(AUTH_MODULE_OPTIONS)
    private readonly options: AuthModuleOptions,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: RegisterDto,
    @Req() req: any,
    @Res({ passthrough: true }) res: any,
  ) {
    const result = await this.authService.register(dto, req);
    if (result.tokens && this.options.cookies?.enabled) {
      this.setCookie(res, result.tokens.accessToken);
    }
    return result;
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() req: any,
    @Res({ passthrough: true }) res: any,
  ) {
    const result = await this.authService.login(dto, req);
    if (result.tokens && this.options.cookies?.enabled) {
      this.setCookie(res, result.tokens.accessToken);
    }
    return result;
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser('id') userId: string,
    @CurrentUser('sessionId') sessionId: string,
    @Body() body: { refreshToken?: string },
    @Res({ passthrough: true }) res: any,
  ) {
    const result = await this.authService.logout(userId, sessionId, body?.refreshToken);
    if (this.options.cookies?.enabled) {
      this.clearCookie(res);
    }
    return result;
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Req() req: any,
    @Res({ passthrough: true }) res: any,
  ) {
    const tokens = await this.authService.refresh(dto.refreshToken, req);
    if (this.options.cookies?.enabled) {
      this.setCookie(res, tokens.accessToken);
    }
    return tokens;
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @Public()
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.forgotPassword({ email: dto.email });
  }

  @UseGuards(AuthGuard)
  @Post('2fa/setup')
  @HttpCode(HttpStatus.OK)
  async setupTwoFactor(@CurrentUser('id') userId: string) {
    return this.authService.generateTwoFactorSecret(userId);
  }

  @UseGuards(AuthGuard)
  @Post('2fa/enable')
  @HttpCode(HttpStatus.OK)
  async enableTwoFactor(
    @CurrentUser('id') userId: string,
    @Body() dto: EnableTwoFactorDto,
  ) {
    return this.authService.enableTwoFactor(userId, dto.code);
  }

  @UseGuards(AuthGuard)
  @Post('2fa/disable')
  @HttpCode(HttpStatus.OK)
  async disableTwoFactor(
    @CurrentUser('id') userId: string,
    @Body() dto: DisableTwoFactorDto,
  ) {
    return this.authService.disableTwoFactor(userId, dto.code);
  }

  @UseGuards(AuthGuard)
  @Get('sessions')
  async getSessions(@CurrentUser('id') userId: string) {
    return this.sessionService.getUserSessions(userId);
  }

  @UseGuards(AuthGuard)
  @Delete('sessions/:id')
  async revokeSession(
    @CurrentUser('id') userId: string,
    @Param('id') sessionId: string,
  ) {
    await this.sessionService.revokeSession(userId, sessionId);
    return { message: 'Session revoked successfully' };
  }

  @UseGuards(AuthGuard)
  @Delete('sessions')
  async revokeAllOtherSessions(
    @CurrentUser('id') userId: string,
    @CurrentUser('sessionId') currentSessionId: string,
  ) {
    await this.sessionService.revokeAllSessions(userId, currentSessionId);
    return { message: 'All other sessions revoked successfully' };
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async getProfile(@CurrentUser() user: any) {
    return user;
  }

  private setCookie(res: any, token: string) {
    if (!res || !res.cookie) return;
    const cookieConfig = this.options.cookies;
    const cookieName = cookieConfig?.name || DEFAULT_COOKIE_NAME;
    res.cookie(cookieName, token, {
      httpOnly: cookieConfig?.httpOnly ?? true,
      secure: cookieConfig?.secure ?? false,
      sameSite: cookieConfig?.sameSite ?? 'lax',
      domain: cookieConfig?.domain,
      path: cookieConfig?.path ?? '/',
      maxAge: cookieConfig?.maxAge ?? 15 * 60 * 1000,
    });
  }

  private clearCookie(res: any) {
    if (!res || !res.clearCookie) return;
    const cookieConfig = this.options.cookies;
    const cookieName = cookieConfig?.name || DEFAULT_COOKIE_NAME;
    res.clearCookie(cookieName, {
      domain: cookieConfig?.domain,
      path: cookieConfig?.path ?? '/',
    });
  }
}
