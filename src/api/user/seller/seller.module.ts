import { Module } from '@nestjs/common';
import { ShopModule } from './shop/shop.module';
import { BusinessAccountModule } from './business-account/business-account.module';

@Module({
  imports: [ShopModule, BusinessAccountModule],
  controllers: [],
})
export class SellerModule {}
