import { Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { OrderStatusEnum } from '@/_db/drizzle/enum/order-status.enum';
import { OrderRepository } from '@/_repositories/user/order.repository/order.repository';
import { OrderStatusTransitionService } from '@/common/services/order/order-status-transition.service';
import { OrderInventoryService } from '@/common/services/order/order-inventory.service';

@Injectable()
export class CancelOrderService {
  constructor(
    private readonly db: DrizzleService,
    private readonly orderRepository: OrderRepository,
    private readonly orderStatusTransitionService: OrderStatusTransitionService,
    private readonly orderInventoryService: OrderInventoryService,
  ) {}

  async execute(userId: string, orderId: string, reason?: string) {
    return await this.db.transaction(async (tx) => {
      const order = await this.orderRepository.getOrderByIdAndUserId(
        orderId,
        userId,
        { tx, lock: true },
      );

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (
        order.status === OrderStatusEnum.CANCELLED ||
        order.status === OrderStatusEnum.EXPIRED
      ) {
        return order;
      }

      this.orderStatusTransitionService.assertBuyerCanCancel(order.status);
      this.orderStatusTransitionService.assertTransition(
        order.status,
        OrderStatusEnum.CANCELLED,
      );

      const previousStatus = order.status;
      const orderItems =
        await this.orderRepository.getOrderItemsByOrderId(orderId);

      const updatedOrder = await this.orderRepository.updateOrder(
        orderId,
        {
          status: OrderStatusEnum.CANCELLED,
          cancelledAt: new Date(),
          cancelledReason: reason ?? null,
        },
        { tx },
      );

      await this.orderInventoryService.releaseOrderReservation(
        orderItems.map((item) => ({
          variantId: item.variantId,
          shopId: order.shopId,
          quantity: item.quantity,
          productName: item.productName,
        })),
        orderId,
        userId,
        tx,
      );

      await this.orderRepository.createOrderStatusHistory(
        {
          orderId,
          fromStatus: previousStatus,
          toStatus: OrderStatusEnum.CANCELLED,
          notes: reason ?? 'Cancelled by buyer',
          changedBy: userId,
        },
        { tx },
      );

      return updatedOrder;
    });
  }
}
