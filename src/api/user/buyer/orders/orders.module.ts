import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { GetOrdersService } from './services/get-orders.service';
import { GetOrderStatsService } from './services/get-order-stats.service';
import { GetOrderGroupService } from './services/get-order-group.service';
import { CancelOrderService } from './services/cancel-order.service';
import { OrderRepositoryModule } from '@/_repositories/user/order.repository/order.repository.module';
import { DrizzleModule } from '@/_db/drizzle/drizzle.module';

@Module({
  controllers: [OrdersController],
  providers: [
    GetOrdersService,
    GetOrderStatsService,
    GetOrderGroupService,
    CancelOrderService,
  ],
  imports: [OrderRepositoryModule, DrizzleModule],
})
export class OrdersModule {}
