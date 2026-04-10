import { Global, Module } from '@nestjs/common';
import { VerifiedUserAuthGuard } from './verified-user-auth.guard';
import { UserAuthGuardModule } from '../user-auth-guard/user-auth-guard.module';
import { EmailVerifiedGuardModule } from '../email-verified-guard/email-verified.guard.module';
import { ShopRepositoryModule } from '@/_repositories/business/shop.repository/shop.repository.module';

@Global()
@Module({
  imports: [UserAuthGuardModule, EmailVerifiedGuardModule, ShopRepositoryModule],
  providers: [VerifiedUserAuthGuard],
  exports: [VerifiedUserAuthGuard, EmailVerifiedGuardModule, ShopRepositoryModule],
})
export class VerifiedUserAuthGuardModule {}
