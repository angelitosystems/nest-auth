import { Injectable, Logger } from '@nestjs/common';
import { MailProvider, SendMailOptions } from '../interfaces/mail-provider.interface';

@Injectable()
export class ConsoleMailProvider implements MailProvider {
  private readonly logger = new Logger('NestAuthMail');

  async sendMail(options: SendMailOptions): Promise<void> {
    this.logger.log(`================== EMAIL SENT ==================`);
    this.logger.log(`To: ${options.to}`);
    this.logger.log(`Subject: ${options.subject}`);
    if (options.text) {
      this.logger.log(`Content:\n${options.text}`);
    }
    if (options.html) {
      this.logger.log(`HTML Preview:\n${options.html}`);
    }
    this.logger.log(`================================================`);
  }
}
