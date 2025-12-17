import { Module } from '@nestjs/common';
import { ShopRepository } from './shop.repository';

@Module({
  providers: [ShopRepository],
  exports: [ShopRepository],
})
export class ShopRepositoryModule {}
