import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderRepository } from '@/_repositories/user/order.repository/order.repository';
import {
  AdminOrderStatsQueryDto,
  AdminOrdersQueryDto,
} from './dto/admin-orders-query.dto';
import {
  mapAdminOrderDetail,
  mapAdminOrderSummary,
} from './admin-orders.mapper';

@Injectable()
export class AdminOrdersService {
  constructor(private readonly orderRepository: OrderRepository) {}

  async listOrders(query: AdminOrdersQueryDto, lang: string) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const result = await this.orderRepository.getAdminOrdersPaginated({
      shopId: query.shopId,
      userId: query.userId,
      page,
      limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      orderStatus: query.status,
      paymentStatus: query.paymentStatus,
      search: query.search,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      lang,
    });

    return {
      data: result.orders.map((order) => mapAdminOrderSummary(order, lang)),
      meta: {
        page,
        limit,
        total: result.total,
      },
    };
  }

  async getOrderStats(query: AdminOrderStatsQueryDto) {
    return this.orderRepository.getAdminOrderStats({
      shopId: query.shopId,
      userId: query.userId,
    });
  }

  async getOrder(orderId: string, lang: string) {
    const order = await this.orderRepository.getAdminOrderDetail(orderId, lang);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return mapAdminOrderDetail(order, lang);
  }
}
