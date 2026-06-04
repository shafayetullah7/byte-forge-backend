import { Module } from '@nestjs/common';
import { CartModule } from './cart/cart.module';
import { AddressesModule } from './addresses/addresses.module';
import { CheckoutModule } from './checkout/checkout.module';

@Module({
  imports: [CartModule, AddressesModule, CheckoutModule],
  exports: [CartModule, AddressesModule, CheckoutModule],
})
export class BuyerApiModule {}
