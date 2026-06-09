export const ShippingMethodEnum = {
  LOCAL_DELIVERY: 'LOCAL_DELIVERY',
  NATIONWIDE_SHIPPING: 'NATIONWIDE_SHIPPING',
  IN_STORE_PICKUP: 'IN_STORE_PICKUP',
  INTERNATIONAL_SHIPPING: 'INTERNATIONAL_SHIPPING',
} as const;

export type TShippingMethod =
  (typeof ShippingMethodEnum)[keyof typeof ShippingMethodEnum];
