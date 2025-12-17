import { Module } from '@nestjs/common';
import { ShopContactRepository } from './shop.contact.repository';

@Module({
  providers: [ShopContactRepository],
  exports: [ShopContactRepository],
})
export class ShopContactRepositoryModule {}
