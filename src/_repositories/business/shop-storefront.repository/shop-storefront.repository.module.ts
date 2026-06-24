import { Module } from '@nestjs/common';
import { ShopStorefrontRepository } from './shop-storefront.repository';

@Module({
  providers: [ShopStorefrontRepository],
  exports: [ShopStorefrontRepository],
})
export class ShopStorefrontRepositoryModule {}
