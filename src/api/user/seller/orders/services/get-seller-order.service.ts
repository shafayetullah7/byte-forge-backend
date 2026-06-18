import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderRepository } from '@/_repositories/user/order.repository';
import { mapSellerOrder } from '../seller-orders.mapper';

@Injectable()
export class GetSellerOrderService {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(shopId: string, orderId: string, lang: string) {
    const order = await this.orderRepository.getSellerOrderDetail(
      orderId,
      shopId,
      lang,
    );

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return mapSellerOrder(order, lang);
  }
}
