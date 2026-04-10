export const ShopStatusEnum = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  DEACTIVATED: 'DEACTIVATED',
} as const;

export type TShopStatus = (typeof ShopStatusEnum)[keyof typeof ShopStatusEnum];
