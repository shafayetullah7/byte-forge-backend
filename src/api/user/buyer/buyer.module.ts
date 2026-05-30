import { Module } from '@nestjs/common';
import { CartModule } from './cart/cart.module';
import { AddressesModule } from './addresses/addresses.module';

@Module({
  imports: [CartModule, AddressesModule],
  exports: [CartModule, AddressesModule],
})
export class BuyerApiModule {}
