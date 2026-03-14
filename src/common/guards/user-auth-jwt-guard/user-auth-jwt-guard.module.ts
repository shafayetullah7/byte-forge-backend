import { Module } from '@nestjs/common';
import { UserAuthJWtGuard } from './user-auth-jwt.guard';
import { UserAuthV2Service } from '@/api/user/user-auth/user-auth-v2.service';
import { CookieModule } from '@/common/modules/cookie/cookie.module';
import { JwtModule } from '@nestjs/jwt';
import { AppConfigModule } from '@/common/modules/app-config/app-config.module';
import { UserSessionRepositoryModule } from '@/_repositories/auth/user-session-repository/user-session-repository.module';
import { SessionRepositoryModule } from '@/_repositories/auth/session.repository/session.repository.module';
import { DrizzleModule } from '@/_db/drizzle/drizzle.module';

@Module({
  imports: [
    CookieModule,
    JwtModule,
    AppConfigModule,
    UserSessionRepositoryModule,
    SessionRepositoryModule,
    DrizzleModule,
  ],
  providers: [UserAuthJWtGuard, UserAuthV2Service],
  exports: [UserAuthJWtGuard],
})
export class UserAuthJWtGuardModule {}
