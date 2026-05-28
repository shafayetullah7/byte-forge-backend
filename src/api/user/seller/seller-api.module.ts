import { Module } from '@nestjs/common';

import { ShopModule } from './shop/shop.module';
import { PlantsModule } from './plants/plants.module';
import { ProductsModule } from './products/products.module';
import { InventoryModule } from './inventory/inventory.module';

@Module({
  imports: [ShopModule, PlantsModule, ProductsModule, InventoryModule],
  exports: [ShopModule],
})
export class SellerApiModule {}
