import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { OrderStatusEnum } from '@/_db/drizzle/enum/order-status.enum';
import { OrderRepository } from '@/_repositories/user/order.repository/order.repository';

const CANCELABLE_STATUSES = [
  OrderStatusEnum.PENDING_PAYMENT,
  OrderStatusEnum.CONFIRMED,
  OrderStatusEnum.PROCESSING,
];

@Injectable()
export class CancelOrderService {
  constructor(
    private readonly db: DrizzleService,
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(userId: string, orderId: string, reason?: string) {
    return await this.db.transaction(async (tx) => {
      // Find the order with a row-level lock to prevent concurrent modifications
      const order = await this.orderRepository.getOrderByIdAndUserId(
        orderId,
        userId,
        { tx, lock: true },
      );

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      // Check if order can be cancelled
      if (!CANCELABLE_STATUSES.includes(order.status as any)) {
        throw new BadRequestException(
          `Order cannot be cancelled in ${order.status} status. Only orders in PENDING_PAYMENT, CONFIRMED, or PROCESSING status can be cancelled.`,
        );
      }

      // If already cancelled or expired, return silently
      if (
        order.status === OrderStatusEnum.CANCELLED ||
        order.status === OrderStatusEnum.EXPIRED
      ) {
        return order;
      }

      const previousStatus = order.status;

      // Update order to cancelled
      const updatedOrder = await this.orderRepository.updateOrder(
        orderId,
        {
          status: OrderStatusEnum.CANCELLED,
          cancelledAt: new Date(),
          cancelledReason: reason ?? null,
        },
        { tx },
      );

      // Record status history
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
