import { Module } from '@nestjs/common';

import { ShopModule } from './shop/shop.module';

@Module({
  imports: [ShopModule],
  exports: [ShopModule],
})
export class SellerApiModule {}
