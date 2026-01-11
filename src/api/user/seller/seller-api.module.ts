import { Module } from '@nestjs/common';
import { BusinessAccountModule } from './business-account/business-account.module';
import { ShopModule } from './shop/shop.module';
import { SellerPlantModule } from './seller-plant/seller-plant.module';

@Module({
  imports: [BusinessAccountModule, ShopModule, SellerPlantModule],
  exports: [BusinessAccountModule, ShopModule, SellerPlantModule],
})
export class SellerApiModule {}
