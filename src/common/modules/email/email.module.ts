import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { GmailProvider } from './providers/gmail.provider';
import { ConsoleProvider } from './providers/console.provider';
import { AppEnvModule } from '@/_config/app-env/app-env.module';

@Module({
  imports: [AppEnvModule],
  controllers: [EmailController],
  providers: [EmailService, GmailProvider, ConsoleProvider],
  exports: [EmailService],
})
export class EmailModule {}
