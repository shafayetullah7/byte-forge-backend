import { Module } from '@nestjs/common';
import { CartRepository } from './cart.repository';

@Module({
  providers: [CartRepository],
  exports: [CartRepository],
})
export class CartRepositoryModule {}
