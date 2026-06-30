import { Module } from '@nestjs/common';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';
import { WishlistRepositoryModule } from '@/_repositories/user/wishlist.repository/wishlist.repository.module';
import { UserAuthGuardModule } from '@/common/guards/user-auth-guard/user-auth-guard.module';

@Module({
  imports: [WishlistRepositoryModule, UserAuthGuardModule],
  controllers: [WishlistController],
  providers: [WishlistService],
})
export class WishlistModule {}
