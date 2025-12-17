import { Module } from '@nestjs/common';
import { BusinessAccountVerificationRepository } from './business.account.verification.repository';

@Module({
  providers: [BusinessAccountVerificationRepository],
  exports: [BusinessAccountVerificationRepository],
})
export class BusinessAccountVerificationRepositoryModule {}
