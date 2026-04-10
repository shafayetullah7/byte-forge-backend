import { Module } from '@nestjs/common';

import { ShopModule } from './shop/shop.module';
import { SellerPlantModule } from './seller-plant/seller-plant.module';

@Module({
  imports: [ShopModule, SellerPlantModule],
  exports: [ShopModule, SellerPlantModule],
})
export class SellerApiModule {}
