import { Module } from '@nestjs/common';
import { OrderStatusTransitionService } from './order-status-transition.service';
import { OrderInventoryService } from './order-inventory.service';
import { InventoryRepositoryModule } from '@/_repositories/business/inventory.repository/inventory.repository.module';

@Module({
  imports: [InventoryRepositoryModule],
  providers: [OrderStatusTransitionService, OrderInventoryService],
  exports: [OrderStatusTransitionService, OrderInventoryService],
})
export class OrderServicesModule {}
