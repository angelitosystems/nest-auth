import { Inject, Injectable, Optional } from '@nestjs/common';
import { AUTH_MAIL_PROVIDER } from '../constants/auth.constants';
import { MailProvider } from '../interfaces/mail-provider.interface';

@Injectable()
export class MailService {
  constructor(
    @Optional()
    @Inject(AUTH_MAIL_PROVIDER)
    private readonly mailProvider?: MailProvider,
  ) {}

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    if (!this.mailProvider) return;
    await this.mailProvider.sendMail({
      to,
      subject: 'Verify your email address',
      text: `Please verify your email using this token: ${token}`,
      html: `<p>Please verify your email using this token: <strong>${token}</strong></p>`,
      context: { token },
    });
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    if (!this.mailProvider) return;
    await this.mailProvider.sendMail({
      to,
      subject: 'Reset your password',
      text: `Please reset your password using this token: ${token}`,
      html: `<p>Please reset your password using this token: <strong>${token}</strong></p>`,
      context: { token },
    });
  }
}
