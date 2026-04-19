import { pgTable, uuid, primaryKey, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { productsTable } from './products.schema';
import { tagsTable } from '../taxonomy/tag.schema';

/**
 * Product-Tag Linking Table
 *
 * CRITICAL: This table enables filtering products by tags
 * Many-to-Many relationship:
 * - One product can have many tags
 * - One tag can be applied to many products
 */
export const productTagsTable = pgTable(
  'product_tags',
  {
    productId: uuid('product_id')
      .notNull()
      .references(() => productsTable.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tagsTable.id, { onDelete: 'cascade' }),
  },
  (t) => [
    primaryKey({ columns: [t.productId, t.tagId] }),
    index('product_tags_product_id_idx').on(t.productId),
    index('product_tags_tag_id_idx').on(t.tagId),
  ],
);

export type TProductTag = typeof productTagsTable.$inferSelect;
export type TNewProductTag = typeof productTagsTable.$inferInsert;

export const productTagsRelations = relations(productTagsTable, ({ one }) => ({
  product: one(productsTable, {
    fields: [productTagsTable.productId],
    references: [productsTable.id],
  }),
  tag: one(tagsTable, {
    fields: [productTagsTable.tagId],
    references: [tagsTable.id],
  }),
}));
