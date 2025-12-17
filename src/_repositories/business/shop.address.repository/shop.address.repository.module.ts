import { Module } from '@nestjs/common';
import { ShopAddressRepository } from './shop.address.repository';

@Module({
  providers: [ShopAddressRepository],
  exports: [ShopAddressRepository],
})
export class ShopAddressRepositoryModule {}
