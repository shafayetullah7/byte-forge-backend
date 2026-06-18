import { OrderStatusEnum, TOrderStatus } from '@/_db/drizzle/enum/order-status.enum';
import { PaymentMethodEnum } from '@/_db/drizzle/enum/payment-method.enum';
import { ShopStatusEnum, TShopStatus } from '@/_db/drizzle/enum/shop.status.enum';
import { OrderStatusTransitionService } from '@/common/services/order/order-status-transition.service';
import type { TShipment } from '@/_db/drizzle/schema';

export type SellerOrderActionKey =
  | 'CONFIRM'
  | 'START_PROCESSING'
  | 'SHIP'
  | 'MARK_DELIVERED'
  | 'CANCEL';

export interface SellerOrderActionDescriptor {
  key: SellerOrderActionKey;
  method: 'PATCH' | 'POST';
  endpoint: 'status' | 'ship' | 'cancel';
  targetStatus?: TOrderStatus;
  requiresConfirmation: boolean;
  requiresForm: boolean;
  primary: boolean;
  disabled: boolean;
  disabledReason: string | null;
}

const TERMINAL_STATUSES: readonly TOrderStatus[] = [
  OrderStatusEnum.DELIVERED,
  OrderStatusEnum.CANCELLED,
  OrderStatusEnum.EXPIRED,
];

export function isSellerOrderReadOnly(status: TOrderStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

export function buildSellerPaymentContext(paymentMethod: string | null) {
  const isCod = paymentMethod === PaymentMethodEnum.COD;
  return {
    collectOnDelivery: isCod,
    completesOnDeliver: isCod,
  };
}

export function buildSellerActionDescriptors(
  transitionService: OrderStatusTransitionService,
  params: {
    status: TOrderStatus;
    paymentMethod: string | null;
    shipment: TShipment | null;
    shopStatus: TShopStatus;
  },
): SellerOrderActionDescriptor[] {
  if (isSellerOrderReadOnly(params.status)) {
    return [];
  }

  const shopInactive = params.shopStatus !== ShopStatusEnum.ACTIVE;
  const shopDisabledReason = shopInactive
    ? 'Shop must be active to perform this action'
    : null;

  const transitions = transitionService.getAllowedTransitions(params.status);
  const descriptors: SellerOrderActionDescriptor[] = [];

  const push = (descriptor: Omit<SellerOrderActionDescriptor, 'disabled' | 'disabledReason'>) => {
    descriptors.push({
      ...descriptor,
      disabled: shopInactive,
      disabledReason: shopDisabledReason,
    });
  };

  if (transitions.includes(OrderStatusEnum.CONFIRMED)) {
    push({
      key: 'CONFIRM',
      method: 'PATCH',
      endpoint: 'status',
      targetStatus: OrderStatusEnum.CONFIRMED,
      requiresConfirmation: false,
      requiresForm: false,
      primary: true,
    });
  }

  if (transitions.includes(OrderStatusEnum.PROCESSING)) {
    push({
      key: 'START_PROCESSING',
      method: 'PATCH',
      endpoint: 'status',
      targetStatus: OrderStatusEnum.PROCESSING,
      requiresConfirmation: false,
      requiresForm: false,
      primary: true,
    });
  }

  if (
    transitions.includes(OrderStatusEnum.SHIPPED) &&
    params.status === OrderStatusEnum.PROCESSING &&
    !params.shipment
  ) {
    push({
      key: 'SHIP',
      method: 'POST',
      endpoint: 'ship',
      requiresConfirmation: false,
      requiresForm: true,
      primary: true,
    });
  }

  if (transitions.includes(OrderStatusEnum.DELIVERED)) {
    const isCod = params.paymentMethod === PaymentMethodEnum.COD;
    push({
      key: 'MARK_DELIVERED',
      method: 'PATCH',
      endpoint: 'status',
      targetStatus: OrderStatusEnum.DELIVERED,
      requiresConfirmation: isCod,
      requiresForm: false,
      primary: true,
    });
  }

  const sellerCancellable =
    params.status === OrderStatusEnum.PENDING_PAYMENT ||
    params.status === OrderStatusEnum.CONFIRMED ||
    params.status === OrderStatusEnum.PROCESSING;

  if (sellerCancellable) {
    push({
      key: 'CANCEL',
      method: 'PATCH',
      endpoint: 'cancel',
      requiresConfirmation: true,
      requiresForm: true,
      primary: false,
    });
  }

  return descriptors;
}
