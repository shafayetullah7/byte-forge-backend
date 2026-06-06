import { Injectable } from '@nestjs/common';
import { OrderRepository } from '@/_repositories/user/order.repository';
import { OrdersFilterDto } from '../dto/orders-pagination.dto';

@Injectable()
export class GetOrdersService {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(
    userId: string,
    filters: OrdersFilterDto,
  ) {
    const result = await this.orderRepository.getBuyerOrderGroupsPaginated({
      userId,
      page: filters.page ?? 1,
      limit: filters.limit ?? 10,
      sortBy: filters.sortBy ?? 'createdAt',
      sortOrder: filters.sortOrder ?? 'desc',
      orderStatus: filters.orderStatus,
      paymentStatus: filters.paymentStatus,
      search: filters.search,
    });

    return {
      groups: result.groups.map((group) => ({
        id: group.id,
        totalAmount: group.totalAmount,
        createdAt: group.createdAt,
        orders: group.orders.map((order: any) => {
          const shopName = order.shop?.translations?.[0]?.name ?? 'Unknown Shop';
          const shopLogo = order.shop?.logo?.url ?? null;
          return {
            id: order.id,
            orderNumber: order.orderNumber,
            shopId: order.shopId,
            shopName,
            shopLogo,
            status: order.status,
            paymentStatus: order.paymentStatus,
            total: order.total,
            createdAt: order.createdAt,
            items: order.items.map((item: any) => ({
              id: item.id,
              productName: item.productName,
              variantTitle: item.variantTitle,
              quantity: item.quantity,
              total: (parseFloat(item.unitPrice) * item.quantity).toFixed(2),
              thumbnail: item.product?.thumbnail
                ? { id: item.product.thumbnail.id, url: item.product.thumbnail.url }
                : null,
            })),
          };
        }),
      })),
      total: result.total,
    };
  }
}
