import { Module } from '@nestjs/common';
import { ShopShippingRatesRepository } from './shop.shipping-rates.repository';

@Module({
  providers: [ShopShippingRatesRepository],
  exports: [ShopShippingRatesRepository],
})
export class ShopShippingRatesRepositoryModule {}
