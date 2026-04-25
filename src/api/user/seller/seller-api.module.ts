import { Module } from '@nestjs/common';

import { ShopModule } from './shop/shop.module';
import { PlantsModule } from './plants/plants.module';

@Module({
  imports: [ShopModule, PlantsModule],
  exports: [ShopModule],
})
export class SellerApiModule {}
