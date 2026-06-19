import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { OrderRepository } from '@/_repositories/user/order.repository';
import { OrderStatusTransitionService } from '@/common/services/order/order-status-transition.service';
import { OrderStatusEnum } from '@/_db/drizzle/enum/order-status.enum';
import { ShippingStatusEnum } from '@/_db/drizzle/enum/shipping-status.enum';

@Injectable()
export class ConfirmDeliveryService {
  constructor(
    private readonly db: DrizzleService,
    private readonly orderRepository: OrderRepository,
    private readonly orderStatusTransitionService: OrderStatusTransitionService,
  ) {}

  async execute(userId: string, orderId: string) {
    return await this.db.transaction(async (tx) => {
      const order = await this.orderRepository.getOrderByIdAndUserId(
        orderId,
        userId,
        { tx, lock: true },
      );

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.status !== OrderStatusEnum.SHIPPED) {
        throw new BadRequestException(
          'Only shipped orders can be confirmed as delivered',
        );
      }

      this.orderStatusTransitionService.assertTransition(
        order.status,
        OrderStatusEnum.DELIVERED,
      );

      const now = new Date();

      await this.orderRepository.updateOrder(
        orderId,
        {
          status: OrderStatusEnum.DELIVERED,
          buyerDeliveryConfirmedAt: now,
        },
        { tx },
      );

      const shipment = await this.orderRepository.getShipmentByOrderId(orderId);
      if (shipment) {
        await this.orderRepository.updateShipment(
          orderId,
          {
            deliveredAt: now,
            status: ShippingStatusEnum.DELIVERED,
          },
          { tx },
        );
      }

      await this.orderRepository.createOrderStatusHistory(
        {
          orderId,
          fromStatus: order.status,
          toStatus: OrderStatusEnum.DELIVERED,
          notes: 'Delivery confirmed by buyer',
          changedBy: userId,
        },
        { tx },
      );

      return { orderId, status: OrderStatusEnum.DELIVERED };
    });
  }
}
