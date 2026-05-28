import { pgTable, uuid, varchar, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { productsTable } from './products.schema';

/**
 * Product SEO Table
 *
 * Stores SEO metadata for all product types (plants, pots, seeds, fertilizers).
 * One-to-one relationship with products.
 */
export const productSeoTable = pgTable('product_seo', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id')
    .notNull()
    .unique()
    .references(() => productsTable.id, { onDelete: 'cascade' }),

  // SEO Fields
  metaTitle: varchar('meta_title', { length: 100 }),
  metaDescription: varchar('meta_description', { length: 255 }),
  slug: varchar('slug', { length: 255 }).unique(),
  focusKeywords: text('focus_keywords'),

  // Internal (not public)
  internalNotes: text('internal_notes'),
});

export type TProductSeo = typeof productSeoTable.$inferSelect;
export type TNewProductSeo = typeof productSeoTable.$inferInsert;

export const productSeoRelations = relations(productSeoTable, ({ one }) => ({
  product: one(productsTable, {
    fields: [productSeoTable.productId],
    references: [productsTable.id],
  }),
}));
