export const ShippingStatusEnum = {
  PENDING: 'PENDING',
  PICKED_UP: 'PICKED_UP',
  IN_TRANSIT: 'IN_TRANSIT',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  RETURNED: 'RETURNED',
  FAILED: 'FAILED',
} as const;

export type TShippingStatus =
  (typeof ShippingStatusEnum)[keyof typeof ShippingStatusEnum];
