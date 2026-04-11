export const ShopStatusEnum = {
  DRAFT: 'DRAFT',
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
  APPROVED: 'APPROVED',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  REJECTED: 'REJECTED',
  SUSPENDED: 'SUSPENDED',
  DELETED: 'DELETED',
} as const;

export type TShopStatus = (typeof ShopStatusEnum)[keyof typeof ShopStatusEnum];
