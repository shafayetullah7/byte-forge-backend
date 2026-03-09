export const ShopVerificationStatusEnum = {
  PENDING: 'PENDING',
  REVIEWING: 'REVIEWING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type TShopVerificationStatus =
  (typeof ShopVerificationStatusEnum)[keyof typeof ShopVerificationStatusEnum];
