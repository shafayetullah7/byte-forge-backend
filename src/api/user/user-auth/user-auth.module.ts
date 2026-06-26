import { Module } from '@nestjs/common';
import { UserAuthService } from './user-auth.service';
import { UserAuthV2Service } from './user-auth-v2.service';
import { UserAuthController } from './user-auth.controller';
import { UserLocalAuthService } from './user-local-auth.service';
import { HashingModule } from '@/common/modules/hashing/hashing.module';
import { UserModule } from '../user/user.module';
import { CookieModule } from '@/common/modules/cookie/cookie.module';
import { UserSessionRepositoryModule } from '@/_repositories/auth/user-session-repository/user-session-repository.module';
import { SessionRepositoryModule } from '@/_repositories/auth/session.repository/session.repository.module';
import { OtpModule } from '@/common/modules/otp/otp.module';
import { EmailModule } from '@/common/modules/email/email.module';
import { UserRepositoryModule } from '@/_repositories/user/user.repository/user.repository.module';
import { UserLocalAuthRepositoryModule } from '@/_repositories/user/user.local.auth.repository/user.local.auth.repository.module';
import { EventsModule } from '@/common/modules/events/events.module';
import { AccountVerificationEmailListener } from './listeners/account-verification-email.listener';

@Module({
  imports: [
    HashingModule,
    UserModule,
    UserSessionRepositoryModule,
    SessionRepositoryModule,
    CookieModule,
    OtpModule,
    EmailModule,
    UserRepositoryModule,
    UserLocalAuthRepositoryModule,
    EventsModule,
  ],
  controllers: [UserAuthController],
  providers: [
    UserAuthService,
    UserLocalAuthService,
    UserAuthV2Service,
    AccountVerificationEmailListener,
  ],
})
export class UserAuthModule {}
