import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { GetOrdersService } from './services/get-orders.service';
import { GetOrderStatsService } from './services/get-order-stats.service';
import { GetOrderGroupService } from './services/get-order-group.service';
import { CancelOrderService } from './services/cancel-order.service';
import { ConfirmDeliveryService } from './services/confirm-delivery.service';
import { OrderRepositoryModule } from '@/_repositories/user/order.repository/order.repository.module';
import { OrderServicesModule } from '@/common/services/order/order-services.module';
import { DrizzleModule } from '@/_db/drizzle/drizzle.module';

@Module({
  controllers: [OrdersController],
  providers: [
    GetOrdersService,
    GetOrderStatsService,
    GetOrderGroupService,
    CancelOrderService,
    ConfirmDeliveryService,
  ],
  imports: [OrderRepositoryModule, OrderServicesModule, DrizzleModule],
})
export class OrdersModule {}
