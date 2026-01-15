import { Global, Module } from '@nestjs/common';
import { VerifiedUserAuthGuard } from './verified-user-auth.guard';
import { UserAuthGuardModule } from '../user-auth-guard/user-auth-guard.module';
import { EmailVerifiedGuardModule } from '../email-verified-guard/email-verified.guard.module';

@Global()
@Module({
  imports: [UserAuthGuardModule, EmailVerifiedGuardModule],
  providers: [VerifiedUserAuthGuard],
  exports: [VerifiedUserAuthGuard, EmailVerifiedGuardModule],
})
export class VerifiedUserAuthGuardModule {}
