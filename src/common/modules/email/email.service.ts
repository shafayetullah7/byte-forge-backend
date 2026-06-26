import { Injectable } from '@nestjs/common';
import { AppEnvService } from '@/_config/app-env/app-env.service';
import { IEmailProvider } from './interfaces/email-provider.interface';
import { GmailProvider } from './providers/gmail.provider';
import { ConsoleProvider } from './providers/console.provider';
import { I18nService } from 'nestjs-i18n';
import { OTP_EXPIRY_MINUTES } from '@/common/modules/otp/otp.constants';

@Injectable()
export class EmailService {
  private provider: IEmailProvider;

  constructor(
    private readonly appEnv: AppEnvService,
    private readonly gmailProvider: GmailProvider,
    private readonly consoleProvider: ConsoleProvider,
    private readonly i18n: I18nService,
  ) {
    const providerType = this.appEnv.MAIL_PROVIDER;

    // Select provider based on configuration
    switch (providerType) {
      case 'gmail':
      case 'smtp':
        this.provider = this.gmailProvider;
        break;
      case 'console':
      default:
        this.provider = this.consoleProvider;
        break;
    }
    console.log(
      '[DEBUG] EmailService initialized with provider:',
      providerType || 'default(console)',
    );
  }

  async sendVerificationEmail(
    to: string,
    otp: string,
    lang: string = 'en',
  ): Promise<void> {
    const subject = this.i18n.t('message.email.verification.subject', { lang });
    const greeting = this.i18n.t('message.email.verification.greeting', {
      lang,
    });
    const body = this.i18n.t('message.email.verification.body', { lang });
    const expiry = this.i18n.t('message.email.verification.expiry', {
      lang,
      args: { minutes: OTP_EXPIRY_MINUTES },
    });
    const ignore = this.i18n.t('message.email.verification.ignore', { lang });

    const text = `${greeting}\n\n${body} ${otp}\n\n${expiry.replace(/<\/?strong>/g, '')}\n\n${ignore}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">${subject}</h2>
        <p>${greeting}</p>
        <p>${body}</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #666;">${expiry}</p>
        <p style="color: #999; font-size: 12px;">${ignore}</p>
      </div>
    `;

    await this.provider.sendEmail({ to, subject, text, html });
  }

  async sendPasswordResetEmail(
    to: string,
    otp: string,
    lang: string = 'en',
  ): Promise<void> {
    const subject = this.i18n.t('message.email.passwordReset.subject', {
      lang,
    });
    const greeting = this.i18n.t('message.email.passwordReset.greeting', {
      lang,
    });
    const body = this.i18n.t('message.email.passwordReset.body', { lang });
    const expiry = this.i18n.t('message.email.passwordReset.expiry', {
      lang,
      args: { minutes: OTP_EXPIRY_MINUTES },
    });
    const ignore = this.i18n.t('message.email.passwordReset.ignore', { lang });

    const text = `${greeting}\n\n${body} ${otp}\n\n${expiry.replace(/<\/?strong>/g, '')}\n\n${ignore}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">${subject}</h2>
        <p>${greeting}</p>
        <p>${body}</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #666;">${expiry}</p>
        <p style="color: #999; font-size: 12px;">${ignore}</p>
      </div>
    `;

    await this.provider.sendEmail({ to, subject, text, html });
  }

  async sendTransactionalEmail(params: {
    to: string;
    subject: string;
    text: string;
    html: string;
  }): Promise<void> {
    await this.provider.sendEmail({
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
  }
}
