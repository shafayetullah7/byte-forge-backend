import { Module } from '@nestjs/common';

import { ShopModule } from './shop/shop.module';
import { PlantsModule } from './plants/plants.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [ShopModule, PlantsModule, ProductsModule],
  exports: [ShopModule],
})
export class SellerApiModule {}
