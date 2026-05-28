import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { GetProductInventoryService } from './services/get-product-inventory.service';
import { GetStockMovementsService } from './services/get-stock-movements.service';
import { RestockVariantService } from './services/restock-variant.service';
import { AdjustStockService } from './services/adjust-stock.service';
import { MarkDamagedService } from './services/mark-damaged.service';
import { VerifiedUserAuthGuardModule } from '@/common/guards/verified-user-auth-guard/verified-user-auth.guard.module';
import { ShopRepositoryModule } from '@/_repositories/business/shop.repository/shop.repository.module';
import { InventoryRepositoryModule } from '@/_repositories/business/inventory.repository/inventory.repository.module';

@Module({
  controllers: [InventoryController],
  providers: [
    InventoryService,
    GetProductInventoryService,
    GetStockMovementsService,
    RestockVariantService,
    AdjustStockService,
    MarkDamagedService,
  ],
  imports: [
    VerifiedUserAuthGuardModule,
    ShopRepositoryModule,
    InventoryRepositoryModule,
  ],
})
export class InventoryModule {}
