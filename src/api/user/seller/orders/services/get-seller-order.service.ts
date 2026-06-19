import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderRepository } from '@/_repositories/user/order.repository';
import type { TAuthorizedShop } from '@/common/types';
import {
  buildMapSellerOrderContext,
  mapSellerOrder,
} from '../seller-orders.mapper';

@Injectable()
export class GetSellerOrderService {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(shop: TAuthorizedShop, orderId: string, lang: string) {
    const order = await this.orderRepository.getSellerOrderDetail(
      orderId,
      shop.id,
      lang,
    );

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return mapSellerOrder(order, lang, buildMapSellerOrderContext(shop, lang));
  }
}
