import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  text,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { ShopContentModerationStatusEnum } from '../../enum';
import { shopTable } from './shop.schema';
import { mediaTable } from '../media';
import { adminTable } from '../admin/admin.schema';
import { shopCampaignTypeEnum } from './shop.campaign-type.enum.schema';
import { shopContentModerationStatusEnum } from './shop.content-moderation-status.enum.schema';

export const shopCampaignsTable = pgTable(
  'shop_campaigns',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    shopId: uuid('shop_id')
      .notNull()
      .references(() => shopTable.id, { onDelete: 'cascade' }),
    slug: varchar('slug', { length: 255 }).notNull(),
    type: shopCampaignTypeEnum('type').notNull(),
    bannerId: uuid('banner_id').references(() => mediaTable.id, {
      onDelete: 'set null',
    }),
    discountPercent: integer('discount_percent'),
    startDate: timestamp('start_date', {
      mode: 'date',
      withTimezone: true,
    }).notNull(),
    endDate: timestamp('end_date', {
      mode: 'date',
      withTimezone: true,
    }).notNull(),
    moderationStatus: shopContentModerationStatusEnum('moderation_status')
      .default(ShopContentModerationStatusEnum.DRAFT)
      .notNull(),
    rejectedReason: text('rejected_reason'),
    moderatedByAdminId: uuid('moderated_by_admin_id').references(
      () => adminTable.id,
      { onDelete: 'set null' },
    ),
    moderatedAt: timestamp('moderated_at', {
      mode: 'date',
      withTimezone: true,
    }),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    unique().on(t.shopId, t.slug),
    index('shop_campaigns_shop_id_idx').on(t.shopId),
    index('shop_campaigns_moderation_status_idx').on(t.moderationStatus),
    index('shop_campaigns_dates_idx').on(t.shopId, t.startDate, t.endDate),
  ],
);

export type TShopCampaign = typeof shopCampaignsTable.$inferSelect;
export type TNewShopCampaign = typeof shopCampaignsTable.$inferInsert;
