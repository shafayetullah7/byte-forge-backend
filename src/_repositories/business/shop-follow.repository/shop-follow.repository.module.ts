import { Module } from '@nestjs/common';
import { ShopFollowRepository } from './shop-follow.repository';

@Module({
  providers: [ShopFollowRepository],
  exports: [ShopFollowRepository],
})
export class ShopFollowRepositoryModule {}
