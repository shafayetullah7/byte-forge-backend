import { pgTable, uuid, varchar, text, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { shopTable } from './shop.schema';
import { languagesTable } from '../i18n/language.schema';

export const shopTranslationsTable = pgTable(
  'shop_translations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    shopId: uuid('shop_id')
      .notNull()
      .references(() => shopTable.id, { onDelete: 'cascade' }),
    locale: varchar('locale', { length: 10 })
      .notNull()
      .references(() => languagesTable.code),
    shopName: varchar('shop_name', { length: 255 }).notNull(),
    about: text('about'),
    brandStory: text('brand_story'),
    featuredHighlight: text('featured_highlight'),
  },
  (t) => [unique().on(t.shopId, t.locale)],
);

export type TShopTranslation = typeof shopTranslationsTable.$inferSelect;
export type TNewShopTranslation = typeof shopTranslationsTable.$inferInsert;

export const shopTranslationsRelations = relations(
  shopTranslationsTable,
  ({ one }) => ({
    shop: one(shopTable, {
      fields: [shopTranslationsTable.shopId],
      references: [shopTable.id],
    }),
    language: one(languagesTable, {
      fields: [shopTranslationsTable.locale],
      references: [languagesTable.code],
    }),
  }),
);
