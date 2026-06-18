import { Module } from '@nestjs/common';

import { ShopModule } from './shop/shop.module';
import { PlantsModule } from './plants/plants.module';
import { ProductsModule } from './products/products.module';
import { InventoryModule } from './inventory/inventory.module';
import { ShippingRatesModule } from './shipping-rates/shipping-rates.module';
import { SellerOrdersModule } from './orders/orders.module';

@Module({
  imports: [
    ShopModule,
    PlantsModule,
    ProductsModule,
    InventoryModule,
    ShippingRatesModule,
    SellerOrdersModule,
  ],
  exports: [ShopModule],
})
export class SellerApiModule {}
