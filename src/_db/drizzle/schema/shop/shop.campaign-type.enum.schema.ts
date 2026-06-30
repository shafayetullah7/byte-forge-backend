import { pgEnum } from 'drizzle-orm/pg-core';
import { ShopCampaignTypeEnum } from '../../enum';

export const shopCampaignTypeEnum = pgEnum('shop_campaign_type_enum', [
  ShopCampaignTypeEnum.DISCOUNT,
  ShopCampaignTypeEnum.BUNDLE,
  ShopCampaignTypeEnum.FLASH_SALE,
  ShopCampaignTypeEnum.SEASONAL,
  ShopCampaignTypeEnum.FREE_SHIPPING,
]);
