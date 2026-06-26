import { pgTable, uuid, varchar, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { shopTable } from './shop.schema';
import { shopValuePointsTable } from './shop.value-point.schema';
import { languagesTable } from '../i18n/language.schema';

export const shopValuePointTranslationsTable = pgTable(
  'shop_value_point_translations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    valuePointId: uuid('value_point_id')
      .notNull()
      .references(() => shopValuePointsTable.id, { onDelete: 'cascade' }),
    locale: varchar('locale', { length: 10 })
      .notNull()
      .references(() => languagesTable.code),
    text: varchar('text', { length: 500 }).notNull(),
  },
  (t) => [
    unique('shop_value_point_translations_item_locale_unique').on(
      t.valuePointId,
      t.locale,
    ),
  ],
);

export type TShopValuePointTranslation =
  typeof shopValuePointTranslationsTable.$inferSelect;
export type TNewShopValuePointTranslation =
  typeof shopValuePointTranslationsTable.$inferInsert;

export const shopValuePointsRelations = relations(
  shopValuePointsTable,
  ({ one, many }) => ({
    shop: one(shopTable, {
      fields: [shopValuePointsTable.shopId],
      references: [shopTable.id],
    }),
    translations: many(shopValuePointTranslationsTable),
  }),
);

export const shopValuePointTranslationsRelations = relations(
  shopValuePointTranslationsTable,
  ({ one }) => ({
    valuePoint: one(shopValuePointsTable, {
      fields: [shopValuePointTranslationsTable.valuePointId],
      references: [shopValuePointsTable.id],
    }),
    language: one(languagesTable, {
      fields: [shopValuePointTranslationsTable.locale],
      references: [languagesTable.code],
    }),
  }),
);
