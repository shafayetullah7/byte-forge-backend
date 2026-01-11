import { Module } from '@nestjs/common';
import { VerifiedUserAuthGuard } from './verified-user-auth.guard';
import { UserAuthGuardModule } from '../user-auth-guard/user-auth-guard.module';
import { EmailVerifiedGuardModule } from '../email-verified-guard/email-verified.guard.module';

@Module({
  imports: [UserAuthGuardModule, EmailVerifiedGuardModule],
  providers: [VerifiedUserAuthGuard],
  exports: [VerifiedUserAuthGuard],
})
export class VerifiedUserAuthGuardModule {}
