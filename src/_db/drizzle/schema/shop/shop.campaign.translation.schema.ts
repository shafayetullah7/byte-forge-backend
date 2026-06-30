import { pgTable, uuid, varchar, text, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { shopCampaignsTable } from './shop.campaign.schema';
import { languagesTable } from '../i18n/language.schema';

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
