import { Module } from '@nestjs/common';
import { SellerPlantController } from './seller-plant.controller';
import { SellerPlantService } from './seller-plant.service';
import { PlantRepositoryModule } from '@/_repositories/business/plant.repository/plant.repository.module';
import { AdminSessionModule } from '@/api/admin/admin-session/admin-session.module';
import { SessionRepositoryModule } from '@/_repositories/auth/session.repository/session.repository.module';
import { DrizzleModule } from '@/_db/drizzle/drizzle.module';
import { VerifiedUserAuthGuardModule } from '@/common/guards/verified-user-auth-guard/verified-user-auth.guard.module';
import { SellerShopGuardModule } from '@/common/guards/seller-shop-guard/seller-shop.guard.module';
import { ShopRepositoryModule } from '@/_repositories/business/shop.repository/shop.repository.module';

@Module({
  imports: [
    PlantRepositoryModule,
    AdminSessionModule,
    SessionRepositoryModule,
    DrizzleModule,
    VerifiedUserAuthGuardModule,
    SellerShopGuardModule,
    ShopRepositoryModule,
  ],
  controllers: [SellerPlantController],
  providers: [SellerPlantService],
})
export class SellerPlantModule {}
