import { Injectable } from '@nestjs/common';
import { OrderRepository } from '@/_repositories/user/order.repository';

@Injectable()
export class GetOrderStatsService {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(userId: string) {
    return this.orderRepository.getBuyerOrderStats(userId);
  }
}
