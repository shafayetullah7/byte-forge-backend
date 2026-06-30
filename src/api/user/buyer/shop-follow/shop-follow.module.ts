import { Module } from '@nestjs/common';
import { ShopFollowController } from './shop-follow.controller';
import { ShopFollowService } from './shop-follow.service';
import { ShopFollowRepositoryModule } from '@/_repositories/business/shop-follow.repository/shop-follow.repository.module';
import { ShopRepositoryModule } from '@/_repositories/business/shop.repository/shop.repository.module';
import { VerifiedUserAuthGuardModule } from '@/common/guards/verified-user-auth-guard/verified-user-auth.guard.module';

@Module({
  imports: [
    ShopFollowRepositoryModule,
    ShopRepositoryModule,
    VerifiedUserAuthGuardModule,
  ],
  controllers: [ShopFollowController],
  providers: [ShopFollowService],
})
export class ShopFollowModule {}
