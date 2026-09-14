export interface SendMailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  template?: string;
  context?: Record<string, any>;
}

export interface MailProvider {
  sendMail(options: SendMailOptions): Promise<void>;
}
