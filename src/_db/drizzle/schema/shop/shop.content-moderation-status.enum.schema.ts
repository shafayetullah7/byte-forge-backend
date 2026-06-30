import { pgEnum } from 'drizzle-orm/pg-core';
import { ShopContentModerationStatusEnum } from '../../enum';

export const shopContentModerationStatusEnum = pgEnum(
  'shop_content_moderation_status_enum',
  [
    ShopContentModerationStatusEnum.DRAFT,
    ShopContentModerationStatusEnum.PENDING,
    ShopContentModerationStatusEnum.APPROVED,
    ShopContentModerationStatusEnum.REJECTED,
    ShopContentModerationStatusEnum.ARCHIVED,
  ],
);
