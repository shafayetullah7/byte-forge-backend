import { pgTable, uuid, primaryKey, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { shopCampaignsTable } from './shop.campaign.schema';
import { productsTable } from '../products/products.schema';

export const shopCampaignProductsTable = pgTable(
  'shop_campaign_products',
  {
    campaignId: uuid('campaign_id')
      .notNull()
      .references(() => shopCampaignsTable.id, { onDelete: 'cascade' }),
    productId: uuid('product_id')
      .notNull()
      .references(() => productsTable.id, { onDelete: 'cascade' }),
  },
  (t) => [
    primaryKey({ columns: [t.campaignId, t.productId] }),
    index('shop_campaign_products_campaign_id_idx').on(t.campaignId),
    index('shop_campaign_products_product_id_idx').on(t.productId),
  ],
);

export type TShopCampaignProduct =
  typeof shopCampaignProductsTable.$inferSelect;
export type TNewShopCampaignProduct =
  typeof shopCampaignProductsTable.$inferInsert;

export const shopCampaignProductsRelations = relations(
  shopCampaignProductsTable,
  ({ one }) => ({
    campaign: one(shopCampaignsTable, {
      fields: [shopCampaignProductsTable.campaignId],
      references: [shopCampaignsTable.id],
    }),
    product: one(productsTable, {
      fields: [shopCampaignProductsTable.productId],
      references: [productsTable.id],
    }),
  }),
);
