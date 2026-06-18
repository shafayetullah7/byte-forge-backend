import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { OrderRepository } from '@/_repositories/user/order.repository';
import { OrderStatusTransitionService } from '@/common/services/order/order-status-transition.service';
import { OrderInventoryService } from '@/common/services/order/order-inventory.service';
import { OrderStatusEnum } from '@/_db/drizzle/enum/order-status.enum';
import { ShippingStatusEnum } from '@/_db/drizzle/enum/shipping-status.enum';
import { ShipOrderDto } from '../dto/ship-order.dto';
import { mapSellerOrder } from '../seller-orders.mapper';

@Injectable()
export class ShipSellerOrderService {
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
    dto: ShipOrderDto,
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

      const orderItems = await this.orderRepository.getOrderItemsByOrderId(
        orderId,
      );

      const shippedAt = new Date();

      await this.orderRepository.createShipment(
        {
          orderId,
          carrier: dto.carrier,
          trackingNumber: dto.trackingNumber,
          status: ShippingStatusEnum.IN_TRANSIT,
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
          notes: `Shipped via ${dto.carrier} (${dto.trackingNumber})`,
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
        throw new NotFoundException('Order not found after shipping');
      }

      return mapSellerOrder(updated, lang);
    });
  }
}
