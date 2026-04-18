import { pgTable, uuid, varchar, text, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { productsTable } from './products.schema';
import { languagesTable } from '../i18n/language.schema';

/**
 * Product Translations Table
 * 
 * Stores bilingual content (name, description) for products.
 * Each product has one row per locale (en, bn).
 */
export const productTranslationsTable = pgTable(
  'product_translations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    productId: uuid('product_id')
      .notNull()
      .references(() => productsTable.id, { onDelete: 'cascade' }),
    locale: varchar('locale', { length: 2 })
      .notNull()
      .references(() => languagesTable.code),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    shortDescription: text('short_description'),
  },
  (t) => [unique().on(t.productId, t.locale)],
);

export type TProductTranslation = typeof productTranslationsTable.$inferSelect;
export type TNewProductTranslation = typeof productTranslationsTable.$inferInsert;

export const productTranslationsRelations = relations(
  productTranslationsTable,
  ({ one }) => ({
    product: one(productsTable, {
      fields: [productTranslationsTable.productId],
      references: [productsTable.id],
    }),
    language: one(languagesTable, {
      fields: [productTranslationsTable.locale],
      references: [languagesTable.code],
    }),
  }),
);
