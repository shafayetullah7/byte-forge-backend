import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { OrderRepository } from '@/_repositories/user/order.repository';
import { OrderStatusTransitionService } from '@/common/services/order/order-status-transition.service';
import { OrderStatusEnum } from '@/_db/drizzle/enum/order-status.enum';
import { ShippingStatusEnum } from '@/_db/drizzle/enum/shipping-status.enum';
import {
  NotificationEventNames,
  OrderStatusChangedEvent,
} from '@/common/modules/events/events';

@Injectable()
export class ConfirmDeliveryService {
  constructor(
    private readonly db: DrizzleService,
    private readonly orderRepository: OrderRepository,
    private readonly orderStatusTransitionService: OrderStatusTransitionService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(userId: string, orderId: string) {
    const emitPayload = await this.db.transaction(async (tx) => {
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

      return {
        orderId,
        orderNumber: order.orderNumber,
        fromStatus: order.status,
        shopId: order.shopId,
        buyerUserId: order.userId,
      };
    });

    this.eventEmitter.emit(
      NotificationEventNames.ORDER_STATUS_CHANGED,
      new OrderStatusChangedEvent({
        orderId: emitPayload.orderId,
        orderNumber: emitPayload.orderNumber,
        fromStatus: emitPayload.fromStatus,
        toStatus: OrderStatusEnum.DELIVERED,
        changedByUserId: userId,
        shopId: emitPayload.shopId,
        buyerUserId: emitPayload.buyerUserId,
      }),
    );

    return { orderId: emitPayload.orderId, status: OrderStatusEnum.DELIVERED };
  }
}
