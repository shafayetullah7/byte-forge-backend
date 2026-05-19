import { Global, Module } from '@nestjs/common';
import { CartAccessGuard } from './cart-access.guard';
import { UserSessionRepositoryModule } from '@/_repositories/auth/user-session-repository/user-session-repository.module';
import { SessionRepositoryModule } from '@/_repositories/auth/session.repository/session.repository.module';

@Global()
@Module({
  imports: [UserSessionRepositoryModule, SessionRepositoryModule],
  providers: [CartAccessGuard],
  exports: [CartAccessGuard],
})
export class CartAccessGuardModule {}
