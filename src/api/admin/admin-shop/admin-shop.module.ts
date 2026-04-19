import { Module } from '@nestjs/common';
import { AdminShopController } from './admin-shop.controller';
import { AdminShopService } from './admin-shop.service';
import { ShopRepositoryModule } from '@/_repositories/business/shop.repository/shop.repository.module';
import { ShopVerificationRepositoryModule } from '@/_repositories/business/shop.verification.repository/shop.verification.repository.module';
import { ShopVerificationHistoryModule } from '@/_repositories/business/shop.verification.history.repository/shop.verification.history.repository.module';
import { AdminAuthGuardModule } from '@/common/guards/admin-auth-guard/admin-auth-guard.module';

@Module({
  controllers: [AdminShopController],
  providers: [AdminShopService],
  imports: [
    ShopRepositoryModule,
    ShopVerificationRepositoryModule,
    ShopVerificationHistoryModule,
    AdminAuthGuardModule,
  ],
  exports: [AdminShopService],
})
export class AdminShopModule {}
