import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { GetOrdersService } from './services/get-orders.service';
import { GetOrderStatsService } from './services/get-order-stats.service';
import { OrderRepositoryModule } from '@/_repositories/user/order.repository/order.repository.module';

@Module({
  controllers: [OrdersController],
  providers: [GetOrdersService, GetOrderStatsService],
  imports: [OrderRepositoryModule],
})
export class OrdersModule {}
