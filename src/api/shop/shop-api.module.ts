import { Module } from '@nestjs/common';
import { PublicShopModule } from './public-shop/public-shop.module';

@Module({
  imports: [PublicShopModule],
  exports: [PublicShopModule],
})
export class ShopApiModule {}
