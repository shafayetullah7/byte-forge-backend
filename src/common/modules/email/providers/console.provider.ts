import { Injectable, Logger } from '@nestjs/common';
import { IEmailProvider } from '../interfaces/email-provider.interface';

@Injectable()
export class ConsoleProvider implements IEmailProvider {
  private readonly logger = new Logger(ConsoleProvider.name);

  // eslint-disable-next-line @typescript-eslint/require-await
  async sendEmail(options: {
    to: string;
    subject: string;
    text?: string;
    html?: string;
  }): Promise<void> {
    this.logger.log('📧 ========== EMAIL (Console Mode) ==========');
    this.logger.log(`To: ${options.to}`);
    this.logger.log(`Subject: ${options.subject}`);
    this.logger.log('---');
    this.logger.log(options.text || options.html || '(no content)');
    this.logger.log('📧 ==========================================');
  }
}
