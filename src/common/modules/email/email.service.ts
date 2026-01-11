import { Injectable } from '@nestjs/common';
import { AppEnvService } from '@/_config/app-env/app-env.service';
import { IEmailProvider } from './interfaces/email-provider.interface';
import { GmailProvider } from './providers/gmail.provider';
import { ConsoleProvider } from './providers/console.provider';

@Injectable()
export class EmailService {
  private provider: IEmailProvider;

  constructor(
    private readonly appEnv: AppEnvService,
    private readonly gmailProvider: GmailProvider,
    private readonly consoleProvider: ConsoleProvider,
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
  }

  async sendVerificationEmail(to: string, otp: string): Promise<void> {
    const subject = 'Verify your email address';
    const text = `Your verification code is: ${otp}\n\nThis code will expire in 15 minutes.\n\nIf you didn't request this code, please ignore this email.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Verify Your Email Address</h2>
        <p>Your verification code is:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #666;">This code will expire in <strong>15 minutes</strong>.</p>
        <p style="color: #999; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
      </div>
    `;

    await this.provider.sendEmail({ to, subject, text, html });
  }

  async sendPasswordResetEmail(to: string, otp: string): Promise<void> {
    const subject = 'Reset your password';
    const text = `Your password reset code is: ${otp}\n\nThis code will expire in 15 minutes.\n\nIf you didn't request this code, please ignore this email.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Reset Your Password</h2>
        <p>Your password reset code is:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #666;">This code will expire in <strong>15 minutes</strong>.</p>
        <p style="color: #999; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
      </div>
    `;

    await this.provider.sendEmail({ to, subject, text, html });
  }
}
