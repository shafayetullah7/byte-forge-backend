import { pgTable, uuid, varchar, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { productVariantsTable } from './product-variants.schema';
import { languagesTable } from '../i18n/language.schema';

/**
 * Product Variant Translations Table
 *
 * Stores localized content for product variants.
 * Each variant has one row per locale (en, bn).
 */
export const productVariantTranslationsTable = pgTable(
  'product_variant_translations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    variantId: uuid('variant_id')
      .notNull()
      .references(() => productVariantsTable.id, { onDelete: 'cascade' }),
    locale: varchar('locale', { length: 2 })
      .notNull()
      .references(() => languagesTable.code),
    title: varchar('title', { length: 255 }).notNull(),
  },
  (t) => [unique().on(t.variantId, t.locale)],
);

export type TProductVariantTranslation =
  typeof productVariantTranslationsTable.$inferSelect;
export type TNewProductVariantTranslation =
  typeof productVariantTranslationsTable.$inferInsert;

export const productVariantTranslationsRelations = relations(
  productVariantTranslationsTable,
  ({ one }) => ({
    variant: one(productVariantsTable, {
      fields: [productVariantTranslationsTable.variantId],
      references: [productVariantsTable.id],
    }),
    language: one(languagesTable, {
      fields: [productVariantTranslationsTable.locale],
      references: [languagesTable.code],
    }),
  }),
);
