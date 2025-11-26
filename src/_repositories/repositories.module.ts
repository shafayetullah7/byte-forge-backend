import { Global, Module } from '@nestjs/common';
import { MediaRepository } from './providers/media/media.repository';
import { BusinessAccountRepository } from './business/business.account.repository';
import { ShopRepository } from './business/shop.repository';

@Global()
@Module({
  providers: [MediaRepository, BusinessAccountRepository, ShopRepository],
  exports: [MediaRepository, BusinessAccountRepository, ShopRepository],
})
export class RepositoriesModule {}
