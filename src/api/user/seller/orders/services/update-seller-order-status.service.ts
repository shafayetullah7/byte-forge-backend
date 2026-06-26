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
import { PaymentStatusEnum } from '@/_db/drizzle/enum/payment-status.enum';
import { PaymentMethodEnum } from '@/_db/drizzle/enum/payment-method.enum';
import { ShippingStatusEnum } from '@/_db/drizzle/enum/shipping-status.enum';
import type { TAuthorizedShop } from '@/common/types';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import {
  buildMapSellerOrderContext,
  mapSellerOrder,
} from '../seller-orders.mapper';
import { assertOrderNotStale } from '../assert-order-not-stale.util';
import {
  NotificationEventNames,
  OrderStatusChangedEvent,
} from '@/common/modules/events/events';

@Injectable()
export class UpdateSellerOrderStatusService {
  constructor(
    private readonly db: DrizzleService,
    private readonly orderRepository: OrderRepository,
    private readonly orderStatusTransitionService: OrderStatusTransitionService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    shop: TAuthorizedShop,
    orderId: string,
    sellerUserId: string,
    dto: UpdateOrderStatusDto,
    lang: string,
  ) {
    const { result, emitPayload } = await this.db.transaction(async (tx) => {
      const order = await this.orderRepository.getOrderByIdAndShopId(
        orderId,
        shop.id,
        { tx, lock: true },
      );

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      assertOrderNotStale(order.updatedAt, dto.expectedUpdatedAt);

      if (order.status === dto.status) {
        throw new BadRequestException(`Order is already ${dto.status}`);
      }

      this.orderStatusTransitionService.assertTransition(
        order.status,
        dto.status,
      );

      const updateData: Partial<typeof order> = {
        status: dto.status,
      };

      if (dto.status === OrderStatusEnum.COMPLETED) {
        if (order.paymentMethod === PaymentMethodEnum.COD) {
          updateData.paymentStatus = PaymentStatusEnum.COMPLETED;
        }
      }

      if (dto.status === OrderStatusEnum.SHIPPED) {
        throw new BadRequestException(
          'Use the ship endpoint to mark an order as shipped with tracking details.',
        );
      }

      if (dto.status === OrderStatusEnum.CANCELLED) {
        throw new BadRequestException(
          'Use the cancel endpoint to cancel an order with a reason.',
        );
      }

      await this.orderRepository.updateOrder(orderId, updateData, { tx });

      if (dto.status === OrderStatusEnum.DELIVERED) {
        const shipment =
          await this.orderRepository.getShipmentByOrderId(orderId);
        if (shipment) {
          await this.orderRepository.updateShipment(
            orderId,
            {
              deliveredAt: new Date(),
              status: ShippingStatusEnum.DELIVERED,
            },
            { tx },
          );
        }
      }

      const historyNotes =
        dto.notes ??
        (dto.status === OrderStatusEnum.PROCESSING
          ? 'Order accepted by seller'
          : dto.status === OrderStatusEnum.CONFIRMED
            ? 'Order packed and ready to ship'
            : dto.status === OrderStatusEnum.DELIVERED
              ? 'Order marked as delivered by seller'
              : dto.status === OrderStatusEnum.COMPLETED
                ? 'COD payment confirmed by seller'
                : `Status updated to ${dto.status} by seller`);

      await this.orderRepository.createOrderStatusHistory(
        {
          orderId,
          fromStatus: order.status,
          toStatus: dto.status,
          notes: historyNotes,
          changedBy: sellerUserId,
        },
        { tx },
      );

      const updated = await this.orderRepository.getSellerOrderDetail(
        orderId,
        shop.id,
        lang,
      );

      if (!updated) {
        throw new NotFoundException('Order not found after update');
      }

      return {
        result: mapSellerOrder(
          updated,
          lang,
          buildMapSellerOrderContext(shop, lang),
        ),
        emitPayload: {
          orderId,
          orderNumber: order.orderNumber,
          fromStatus: order.status,
          toStatus: dto.status,
          changedByUserId: sellerUserId,
          shopId: shop.id,
          buyerUserId: order.userId,
          notes: historyNotes,
        },
      };
    });

    this.eventEmitter.emit(
      NotificationEventNames.ORDER_STATUS_CHANGED,
      new OrderStatusChangedEvent(emitPayload),
    );

    return result;
  }
}
