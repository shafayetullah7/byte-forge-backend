import type { TOrderStatus } from '@/_db/drizzle/enum/order-status.enum';

export class UserLoggedInEvent {
  userId: string;
  guestToken?: string;
}

export const AuthEventNames = {
  ACCOUNT_VERIFICATION_REQUESTED: 'auth.verification.requested',
} as const;

export class AccountVerificationRequestedEvent {
  constructor(
    public readonly payload: {
      userId: string;
      lang: string;
      force?: boolean;
    },
  ) {}
}

export const NotificationEventNames = {
  ORDER_PLACED: 'order.placed',
  ORDER_STATUS_CHANGED: 'order.status.changed',
  SHOP_VERIFICATION_SUBMITTED: 'shop.verification.submitted',
  SHOP_VERIFICATION_DECIDED: 'shop.verification.decided',
} as const;

export type PlacedOrderSummary = {
  orderId: string;
  orderNumber: string;
  shopId: string;
  shopName: string;
  total: string;
};

export class OrderPlacedEvent {
  constructor(
    public readonly payload: {
      orderGroupId: string;
      buyerUserId: string;
      totalAmount: string;
      orders: PlacedOrderSummary[];
    },
  ) {}
}

export class OrderStatusChangedEvent {
  constructor(
    public readonly payload: {
      orderId: string;
      orderNumber: string;
      fromStatus: TOrderStatus;
      toStatus: TOrderStatus;
      changedByUserId: string;
      shopId: string;
      buyerUserId: string;
      notes?: string | null;
    },
  ) {}
}

export class ShopVerificationSubmittedEvent {
  constructor(
    public readonly payload: {
      shopId: string;
      ownerId: string;
    },
  ) {}
}

export type ShopVerificationDecision = 'approved' | 'rejected';

export class ShopVerificationDecidedEvent {
  constructor(
    public readonly payload: {
      shopId: string;
      ownerId: string;
      decision: ShopVerificationDecision;
      reason?: string | null;
    },
  ) {}
}
