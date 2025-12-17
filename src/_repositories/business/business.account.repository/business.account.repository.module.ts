import { Module } from '@nestjs/common';
import { BusinessAccountRepository } from './business.account.repository';

@Module({
  providers: [BusinessAccountRepository],
  exports: [BusinessAccountRepository],
})
export class BusinessAccountRepositoryModule {}
