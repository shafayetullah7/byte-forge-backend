import { BadRequestException, Injectable } from '@nestjs/common';
import {
  OrderStatusEnum,
  TOrderStatus,
} from '@/_db/drizzle/enum/order-status.enum';

const ORDER_STATUS_TRANSITIONS: Record<TOrderStatus, readonly TOrderStatus[]> = {
  [OrderStatusEnum.PENDING_PAYMENT]: [
    OrderStatusEnum.PROCESSING,
    OrderStatusEnum.CANCELLED,
    OrderStatusEnum.EXPIRED,
  ],
  [OrderStatusEnum.PROCESSING]: [
    OrderStatusEnum.CONFIRMED,
    OrderStatusEnum.CANCELLED,
  ],
  [OrderStatusEnum.CONFIRMED]: [
    OrderStatusEnum.SHIPPED,
    OrderStatusEnum.CANCELLED,
  ],
  [OrderStatusEnum.SHIPPED]: [OrderStatusEnum.DELIVERED],
  [OrderStatusEnum.DELIVERED]: [OrderStatusEnum.COMPLETED],
  [OrderStatusEnum.COMPLETED]: [],
  [OrderStatusEnum.CANCELLED]: [],
  [OrderStatusEnum.EXPIRED]: [],
};

const BUYER_CANCELLABLE_STATUSES: readonly TOrderStatus[] = [
  OrderStatusEnum.PENDING_PAYMENT,
  OrderStatusEnum.PROCESSING,
];

const SELLER_CANCELLABLE_STATUSES: readonly TOrderStatus[] = [
  OrderStatusEnum.PENDING_PAYMENT,
  OrderStatusEnum.PROCESSING,
  OrderStatusEnum.CONFIRMED,
];

@Injectable()
export class OrderStatusTransitionService {
  assertTransition(from: TOrderStatus, to: TOrderStatus): void {
    const allowed = ORDER_STATUS_TRANSITIONS[from] ?? [];
    if (!allowed.includes(to)) {
      throw new BadRequestException(
        `Cannot transition order from ${from} to ${to}`,
      );
    }
  }

  assertBuyerCanCancel(status: TOrderStatus): void {
    if (!BUYER_CANCELLABLE_STATUSES.includes(status)) {
      throw new BadRequestException(
        `Order cannot be cancelled in ${status} status. Only orders in PENDING_PAYMENT or PROCESSING status can be cancelled.`,
      );
    }
  }

  assertSellerCanCancel(status: TOrderStatus): void {
    if (!SELLER_CANCELLABLE_STATUSES.includes(status)) {
      throw new BadRequestException(
        `Order cannot be cancelled in ${status} status.`,
      );
    }
  }

  getAllowedTransitions(from: TOrderStatus): readonly TOrderStatus[] {
    return ORDER_STATUS_TRANSITIONS[from] ?? [];
  }
}
