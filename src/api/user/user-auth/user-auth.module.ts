import { Module } from '@nestjs/common';
import { UserAuthService } from './user-auth.service';
import { UserAuthController } from './user-auth.controller';
import { UserLocalAuthService } from './user-local-auth.service';
import { HashingModule } from '@/common/modules/hashing/hashing.module';
import { UserModule } from '../user/user.module';
import { UserLocalStrategy } from './strategies/user-local.strategy';
import { CookieModule } from '@/common/modules/cookie/cookie.module';
import { UserSessionRepositoryModule } from '@/_repositories/auth/user-session-repository/user-session-repository.module';
import { SessionRepositoryModule } from '@/_repositories/auth/session.repository/session.repository.module';
import { UserLocalAuthSessionRepositoryModule } from '@/_repositories/auth/user-local-auth-session-repository/user-local-auth-session-repository.module';

@Module({
  imports: [
    HashingModule,
    UserModule,
    UserSessionRepositoryModule,
    SessionRepositoryModule,
    UserLocalAuthSessionRepositoryModule,
    HashingModule,
    CookieModule,
  ],
  controllers: [UserAuthController],
  providers: [UserAuthService, UserLocalAuthService, UserLocalStrategy],
})
export class UserAuthModule {}
