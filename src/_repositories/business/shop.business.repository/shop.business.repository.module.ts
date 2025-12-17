import { Module } from '@nestjs/common';
import { ShopBusinessRepository } from './shop.business.repository';

@Module({
  providers: [ShopBusinessRepository],
  exports: [ShopBusinessRepository],
})
export class ShopBusinessRepositoryModule {}
