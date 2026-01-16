import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PasswordResetService } from './password-reset.service';
import { PasswordResetController } from './password-reset.controller';
import { UserLocalAuthRepositoryModule } from '@/_repositories/user/user.local.auth.repository/user.local.auth.repository.module';
import { OtpModule } from '@/common/modules/otp/otp.module';
import { EmailModule } from '@/common/modules/email/email.module';
import { HashingModule } from '@/common/modules/hashing/hashing.module';

@Module({
  imports: [
    JwtModule.register({}),
    UserLocalAuthRepositoryModule,
    OtpModule,
    EmailModule,
    HashingModule,
  ],
  controllers: [PasswordResetController],
  providers: [PasswordResetService],
})
export class PasswordResetModule {}
