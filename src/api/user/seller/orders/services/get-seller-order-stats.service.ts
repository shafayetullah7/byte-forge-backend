import { Injectable } from '@nestjs/common';
import { OrderRepository } from '@/_repositories/user/order.repository';

@Injectable()
export class GetSellerOrderStatsService {
  constructor(private readonly orderRepository: OrderRepository) {}

  execute(shopId: string) {
    return this.orderRepository.getSellerOrderStats(shopId);
  }
}
