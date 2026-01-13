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
import { OtpModule } from '@/common/modules/otp/otp.module';
import { EmailModule } from '@/common/modules/email/email.module';
import { UserRepositoryModule } from '@/_repositories/user/user.repository/user.repository.module';
import { UserLocalAuthRepositoryModule } from '@/_repositories/user/user.local.auth.repository/user.local.auth.repository.module';

@Module({
  imports: [
    HashingModule,
    UserModule,
    UserSessionRepositoryModule,
    SessionRepositoryModule,
    UserLocalAuthSessionRepositoryModule,
    CookieModule,
    OtpModule,
    EmailModule,
    UserRepositoryModule,
    UserLocalAuthRepositoryModule,
  ],
  controllers: [UserAuthController],
  providers: [UserAuthService, UserLocalAuthService, UserLocalStrategy],
})
export class UserAuthModule {}
