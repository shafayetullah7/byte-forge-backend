import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { OrderRepository } from '@/_repositories/user/order.repository';
import { OrderStatusTransitionService } from '@/common/services/order/order-status-transition.service';
import { OrderInventoryService } from '@/common/services/order/order-inventory.service';
import { OrderStatusEnum } from '@/_db/drizzle/enum/order-status.enum';
import type { TAuthorizedShop } from '@/common/types';
import { CancelSellerOrderDto } from '../dto/cancel-order.dto';
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
export class CancelSellerOrderService {
  constructor(
    private readonly db: DrizzleService,
    private readonly orderRepository: OrderRepository,
    private readonly orderStatusTransitionService: OrderStatusTransitionService,
    private readonly orderInventoryService: OrderInventoryService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    shop: TAuthorizedShop,
    orderId: string,
    sellerUserId: string,
    dto: CancelSellerOrderDto,
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

      if (
        order.status === OrderStatusEnum.CANCELLED ||
        order.status === OrderStatusEnum.EXPIRED
      ) {
        const existing = await this.orderRepository.getSellerOrderDetail(
          orderId,
          shop.id,
          lang,
        );
        if (!existing) {
          throw new NotFoundException('Order not found');
        }
        return {
          result: mapSellerOrder(
            existing,
            lang,
            buildMapSellerOrderContext(shop, lang),
          ),
          emitPayload: null,
        };
      }

      this.orderStatusTransitionService.assertSellerCanCancel(order.status);
      this.orderStatusTransitionService.assertTransition(
        order.status,
        OrderStatusEnum.CANCELLED,
      );

      const orderItems =
        await this.orderRepository.getOrderItemsByOrderId(orderId);

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
        shop.id,
        lang,
      );

      if (!updated) {
        throw new NotFoundException('Order not found after cancellation');
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
          toStatus: OrderStatusEnum.CANCELLED,
          changedByUserId: sellerUserId,
          shopId: shop.id,
          buyerUserId: order.userId,
          notes: dto.reason,
        },
      };
    });

    if (emitPayload) {
      this.eventEmitter.emit(
        NotificationEventNames.ORDER_STATUS_CHANGED,
        new OrderStatusChangedEvent(emitPayload),
      );
    }

    return result;
  }
}
