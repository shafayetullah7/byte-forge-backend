import { Module } from '@nestjs/common';
import { PublicShopController } from './public-shop.controller';
import { PublicShopService } from './public-shop.service';
import { ShopRepository } from '@/_repositories/business/shop.repository/shop.repository';
import { ShopShippingRatesRepository } from '@/_repositories/business/shop.shipping-rates.repository/shop.shipping-rates.repository';

@Module({
  controllers: [PublicShopController],
  providers: [PublicShopService, ShopRepository, ShopShippingRatesRepository],
})
export class PublicShopModule {}
