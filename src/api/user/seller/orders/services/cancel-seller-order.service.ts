import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { OrderRepository } from '@/_repositories/user/order.repository';
import { OrderStatusTransitionService } from '@/common/services/order/order-status-transition.service';
import { OrderInventoryService } from '@/common/services/order/order-inventory.service';
import { OrderStatusEnum } from '@/_db/drizzle/enum/order-status.enum';
import { CancelSellerOrderDto } from '../dto/cancel-order.dto';
import { mapSellerOrder } from '../seller-orders.mapper';

@Injectable()
export class CancelSellerOrderService {
  constructor(
    private readonly db: DrizzleService,
    private readonly orderRepository: OrderRepository,
    private readonly orderStatusTransitionService: OrderStatusTransitionService,
    private readonly orderInventoryService: OrderInventoryService,
  ) {}

  async execute(
    shopId: string,
    orderId: string,
    sellerUserId: string,
    dto: CancelSellerOrderDto,
    lang: string,
  ) {
    return await this.db.transaction(async (tx) => {
      const order = await this.orderRepository.getOrderByIdAndShopId(
        orderId,
        shopId,
        { tx, lock: true },
      );

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (
        order.status === OrderStatusEnum.CANCELLED ||
        order.status === OrderStatusEnum.EXPIRED
      ) {
        const existing = await this.orderRepository.getSellerOrderDetail(
          orderId,
          shopId,
          lang,
        );
        if (!existing) {
          throw new NotFoundException('Order not found');
        }
        return mapSellerOrder(existing, lang);
      }

      this.orderStatusTransitionService.assertSellerCanCancel(order.status);
      this.orderStatusTransitionService.assertTransition(
        order.status,
        OrderStatusEnum.CANCELLED,
      );

      const orderItems = await this.orderRepository.getOrderItemsByOrderId(
        orderId,
      );

      await this.orderRepository.updateOrder(
        orderId,
        {
          status: OrderStatusEnum.CANCELLED,
          cancelledAt: new Date(),
          cancelledReason: dto.reason,
        },
        { tx },
      );

      await this.orderInventoryService.releaseOrderReservation(
        orderItems.map((item) => ({
          variantId: item.variantId,
          shopId: order.shopId,
          quantity: item.quantity,
        })),
        orderId,
        sellerUserId,
        tx,
      );

      await this.orderRepository.createOrderStatusHistory(
        {
          orderId,
          fromStatus: order.status,
          toStatus: OrderStatusEnum.CANCELLED,
          notes: dto.reason,
          changedBy: sellerUserId,
        },
        { tx },
      );

      const updated = await this.orderRepository.getSellerOrderDetail(
        orderId,
        shopId,
        lang,
      );

      if (!updated) {
        throw new NotFoundException('Order not found after cancellation');
      }

      return mapSellerOrder(updated, lang);
    });
  }
}
