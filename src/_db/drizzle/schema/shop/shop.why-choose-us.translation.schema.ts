import { pgTable, uuid, varchar, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { shopTable } from './shop.schema';
import { shopWhyChooseUsTable } from './shop.why-choose-us.schema';
import { languagesTable } from '../i18n/language.schema';

export const shopWhyChooseUsTranslationsTable = pgTable(
  'shop_why_choose_us_translations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    whyChooseUsId: uuid('why_choose_us_id')
      .notNull()
      .references(() => shopWhyChooseUsTable.id, { onDelete: 'cascade' }),
    locale: varchar('locale', { length: 10 })
      .notNull()
      .references(() => languagesTable.code),
    text: varchar('text', { length: 500 }).notNull(),
  },
  (t) => [
    unique('shop_why_choose_us_translations_item_locale_unique').on(
      t.whyChooseUsId,
      t.locale,
    ),
  ],
);

export type TShopWhyChooseUsTranslation =
  typeof shopWhyChooseUsTranslationsTable.$inferSelect;
export type TNewShopWhyChooseUsTranslation =
  typeof shopWhyChooseUsTranslationsTable.$inferInsert;

export const shopWhyChooseUsRelations = relations(
  shopWhyChooseUsTable,
  ({ one, many }) => ({
    shop: one(shopTable, {
      fields: [shopWhyChooseUsTable.shopId],
      references: [shopTable.id],
    }),
    translations: many(shopWhyChooseUsTranslationsTable),
  }),
);

export const shopWhyChooseUsTranslationsRelations = relations(
  shopWhyChooseUsTranslationsTable,
  ({ one }) => ({
    whyChooseUs: one(shopWhyChooseUsTable, {
      fields: [shopWhyChooseUsTranslationsTable.whyChooseUsId],
      references: [shopWhyChooseUsTable.id],
    }),
    language: one(languagesTable, {
      fields: [shopWhyChooseUsTranslationsTable.locale],
      references: [languagesTable.code],
    }),
  }),
);
