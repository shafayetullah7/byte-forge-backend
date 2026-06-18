import { Injectable } from '@nestjs/common';
import { OrderRepository } from '@/_repositories/user/order.repository';
import { SellerOrdersFilterDto } from '../dto/seller-orders-filter.dto';
import { mapSellerOrderSummary } from '../seller-orders.mapper';

@Injectable()
export class GetSellerOrdersService {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(shopId: string, filters: SellerOrdersFilterDto, lang: string) {
    const result = await this.orderRepository.getSellerOrdersPaginated({
      shopId,
      page: filters.page ?? 1,
      limit: filters.limit ?? 10,
      sortBy: filters.sortBy ?? 'createdAt',
      sortOrder: filters.sortOrder ?? 'desc',
      orderStatus: filters.orderStatus,
      paymentStatus: filters.paymentStatus,
      search: filters.search,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      lang,
    });

    return {
      orders: result.orders.map((order) => mapSellerOrderSummary(order, lang)),
      total: result.total,
    };
  }
}
