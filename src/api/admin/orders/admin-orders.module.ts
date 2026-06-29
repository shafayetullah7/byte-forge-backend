import { Module } from '@nestjs/common';
import { OrderRepositoryModule } from '@/_repositories/user/order.repository/order.repository.module';
import { AdminOrdersController } from './admin-orders.controller';
import { AdminOrdersService } from './admin-orders.service';

@Module({
  imports: [OrderRepositoryModule],
  controllers: [AdminOrdersController],
  providers: [AdminOrdersService],
  exports: [AdminOrdersService],
})
export class AdminOrdersModule {}
