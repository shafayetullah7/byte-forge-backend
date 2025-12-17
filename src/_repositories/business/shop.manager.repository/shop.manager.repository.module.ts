import { Module } from '@nestjs/common';
import { ShopManagerRepository } from './shop.manager.repository';

@Module({
  providers: [ShopManagerRepository],
  exports: [ShopManagerRepository],
})
export class ShopManagerRepositoryModule {}
