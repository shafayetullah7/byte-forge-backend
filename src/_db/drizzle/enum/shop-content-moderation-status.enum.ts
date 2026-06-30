export const ShopContentModerationStatusEnum = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  ARCHIVED: 'ARCHIVED',
} as const;

export type TShopContentModerationStatus =
  (typeof ShopContentModerationStatusEnum)[keyof typeof ShopContentModerationStatusEnum];
