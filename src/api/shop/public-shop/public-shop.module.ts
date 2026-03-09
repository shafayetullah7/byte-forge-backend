import { Module } from '@nestjs/common';
import { PublicShopController } from './public-shop.controller';
import { PublicShopService } from './public-shop.service';
import { ShopRepository } from '@/_repositories/business/shop.repository/shop.repository';

@Module({
  controllers: [PublicShopController],
  providers: [PublicShopService, ShopRepository],
})
export class PublicShopModule {}
