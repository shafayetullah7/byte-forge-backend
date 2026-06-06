import { Module } from '@nestjs/common';
import { CartModule } from './cart/cart.module';
import { AddressesModule } from './addresses/addresses.module';
import { CheckoutModule } from './checkout/checkout.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [CartModule, AddressesModule, CheckoutModule, OrdersModule],
  exports: [CartModule, AddressesModule, CheckoutModule, OrdersModule],
})
export class BuyerApiModule {}
