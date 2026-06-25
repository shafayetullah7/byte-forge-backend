import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { OrderRepository } from '@/_repositories/user/order.repository';
import { OrderStatusTransitionService } from '@/common/services/order/order-status-transition.service';
import { OrderInventoryService } from '@/common/services/order/order-inventory.service';
import { OrderStatusEnum } from '@/_db/drizzle/enum/order-status.enum';
import { ShippingStatusEnum } from '@/_db/drizzle/enum/shipping-status.enum';
import type { TAuthorizedShop } from '@/common/types';
import { ShipOrderDto } from '../dto/ship-order.dto';
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
export class ShipSellerOrderService {
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
    dto: ShipOrderDto,
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

      if (order.status === OrderStatusEnum.SHIPPED) {
        const existingShipment =
          await this.orderRepository.getShipmentByOrderId(orderId);
        if (existingShipment) {
          throw new BadRequestException('Order has already been shipped');
        }
      }

      this.orderStatusTransitionService.assertTransition(
        order.status,
        OrderStatusEnum.SHIPPED,
      );

      const existingShipment =
        await this.orderRepository.getShipmentByOrderId(orderId);
      if (existingShipment) {
        throw new BadRequestException('Shipment already exists for this order');
      }

      const orderItems =
        await this.orderRepository.getOrderItemsByOrderId(orderId);

      const shippedAt = new Date();
      const shippingMethod = dto.shippingMethod ?? 'COURIER';
      const shipmentStatus =
        shippingMethod === 'COURIER'
          ? ShippingStatusEnum.IN_TRANSIT
          : ShippingStatusEnum.PENDING;

      const shipNotes =
        dto.notes?.trim() ||
        (shippingMethod === 'COURIER'
          ? `Shipped via ${dto.carrier} (${dto.trackingNumber})`
          : shippingMethod === 'SELF_DELIVERY'
            ? 'Self delivery arranged by seller'
            : 'Customer pickup arranged');

      await this.orderRepository.createShipment(
        {
          orderId,
          carrier: dto.carrier ?? null,
          trackingNumber: dto.trackingNumber ?? null,
          shippingMethod,
          status: shipmentStatus,
          shippedAt,
          estimatedDelivery: dto.estimatedDelivery
            ? new Date(dto.estimatedDelivery)
            : null,
        },
        { tx },
      );

      await this.orderRepository.updateOrder(
        orderId,
        { status: OrderStatusEnum.SHIPPED },
        { tx },
      );

      await this.orderInventoryService.fulfillOrder(
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
          toStatus: OrderStatusEnum.SHIPPED,
          notes: shipNotes,
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
        throw new NotFoundException('Order not found after shipping');
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
          toStatus: OrderStatusEnum.SHIPPED,
          changedByUserId: sellerUserId,
          shopId: shop.id,
          buyerUserId: order.userId,
          notes: shipNotes,
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
