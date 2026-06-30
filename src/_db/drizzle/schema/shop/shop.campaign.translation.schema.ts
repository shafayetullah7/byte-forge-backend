import { pgTable, uuid, varchar, text, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { shopCampaignsTable } from './shop.campaign.schema';
import { shopCampaignProductsTable } from './shop.campaign-product.schema';
import { languagesTable } from '../i18n/language.schema';
import { shopTable } from './shop.schema';
import { mediaTable } from '../media';
import { adminTable } from '../admin/admin.schema';

export const shopCampaignTranslationsTable = pgTable(
  'shop_campaign_translations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    campaignId: uuid('campaign_id')
      .notNull()
      .references(() => shopCampaignsTable.id, { onDelete: 'cascade' }),
    locale: varchar('locale', { length: 10 })
      .notNull()
      .references(() => languagesTable.code),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
  },
  (t) => [unique().on(t.campaignId, t.locale)],
);

export type TShopCampaignTranslation =
  typeof shopCampaignTranslationsTable.$inferSelect;
export type TNewShopCampaignTranslation =
  typeof shopCampaignTranslationsTable.$inferInsert;

export const shopCampaignsRelations = relations(
  shopCampaignsTable,
  ({ one, many }) => ({
    shop: one(shopTable, {
      fields: [shopCampaignsTable.shopId],
      references: [shopTable.id],
    }),
    banner: one(mediaTable, {
      fields: [shopCampaignsTable.bannerId],
      references: [mediaTable.id],
    }),
    moderatedByAdmin: one(adminTable, {
      fields: [shopCampaignsTable.moderatedByAdminId],
      references: [adminTable.id],
    }),
    translations: many(shopCampaignTranslationsTable),
    products: many(shopCampaignProductsTable),
  }),
);

export const shopCampaignTranslationsRelations = relations(
  shopCampaignTranslationsTable,
  ({ one }) => ({
    campaign: one(shopCampaignsTable, {
      fields: [shopCampaignTranslationsTable.campaignId],
      references: [shopCampaignsTable.id],
    }),
    language: one(languagesTable, {
      fields: [shopCampaignTranslationsTable.locale],
      references: [languagesTable.code],
    }),
  }),
);
