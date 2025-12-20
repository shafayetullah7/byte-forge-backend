import { Global, Module } from '@nestjs/common';
import { UserAuthGuard } from './user-auth.guard';
import { UserSessionRepositoryModule } from '@/_repositories/auth/user-session-repository/user-session-repository.module';
import { SessionRepositoryModule } from '@/_repositories/auth/session.repository/session.repository.module';

@Global()
@Module({
  imports: [UserSessionRepositoryModule, SessionRepositoryModule],
  providers: [UserAuthGuard],
  exports: [
    UserAuthGuard,
    UserSessionRepositoryModule,
    SessionRepositoryModule,
  ],
})
export class UserAuthGuardModule {}
