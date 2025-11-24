import { Global, Module } from '@nestjs/common';
import { MediaRepository } from './providers/media/media.repository';
import { BusinessAccountRepository } from './business/business.account.repository';

@Global()
@Module({
  providers: [MediaRepository, BusinessAccountRepository],
  exports: [MediaRepository, BusinessAccountRepository],
})
export class RepositoriesModule {}
