export const ShopCampaignTypeEnum = {
  DISCOUNT: 'DISCOUNT',
  BUNDLE: 'BUNDLE',
  FLASH_SALE: 'FLASH_SALE',
  SEASONAL: 'SEASONAL',
  FREE_SHIPPING: 'FREE_SHIPPING',
} as const;

export type TShopCampaignType =
  (typeof ShopCampaignTypeEnum)[keyof typeof ShopCampaignTypeEnum];
