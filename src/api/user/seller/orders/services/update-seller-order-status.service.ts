import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { OrderRepository } from '@/_repositories/user/order.repository';
import { OrderStatusTransitionService } from '@/common/services/order/order-status-transition.service';
import { OrderStatusEnum } from '@/_db/drizzle/enum/order-status.enum';
import { PaymentStatusEnum } from '@/_db/drizzle/enum/payment-status.enum';
import { PaymentMethodEnum } from '@/_db/drizzle/enum/payment-method.enum';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { mapSellerOrder } from '../seller-orders.mapper';

@Injectable()
export class UpdateSellerOrderStatusService {
  constructor(
    private readonly db: DrizzleService,
    private readonly orderRepository: OrderRepository,
    private readonly orderStatusTransitionService: OrderStatusTransitionService,
  ) {}

  async execute(
    shopId: string,
    orderId: string,
    sellerUserId: string,
    dto: UpdateOrderStatusDto,
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

      if (
        dto.status === OrderStatusEnum.DELIVERED &&
        order.paymentMethod === PaymentMethodEnum.COD
      ) {
        updateData.paymentStatus = PaymentStatusEnum.COMPLETED;
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

      await this.orderRepository.createOrderStatusHistory(
        {
          orderId,
          fromStatus: order.status,
          toStatus: dto.status,
          notes: dto.notes ?? `Status updated to ${dto.status} by seller`,
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
        throw new NotFoundException('Order not found after update');
      }

      return mapSellerOrder(updated, lang);
    });
  }
}
