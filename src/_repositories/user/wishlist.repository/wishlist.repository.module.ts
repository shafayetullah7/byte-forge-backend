import { Module } from '@nestjs/common';
import { WishlistRepository } from './wishlist.repository';

@Module({
  providers: [WishlistRepository],
  exports: [WishlistRepository],
})
export class WishlistRepositoryModule {}
