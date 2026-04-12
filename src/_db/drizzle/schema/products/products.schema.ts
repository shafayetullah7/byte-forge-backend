import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { shopTable } from '../shop';
import { categoriesTable } from '../taxonomy/category.schema';
import { mediaTable } from '../media/media.schema';
import { productTypeEnum } from '../../enum/product-type.enum';
import { productStatusEnum } from '../../enum/product-status.enum';

/**
 * Unified Products Table
 * 
 * Supports multiple product types: plant, pot, seed, fertilizer
 * Every product must have at least one variant (tracked via baseVariantId)
 * 
 * @see product_variants - Cart/Orders reference this table
 * @see product_translations - Bilingual content
 * @see product_tags - Flexible filtering
 */
export const productsTable = pgTable(
  'products',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    shopId: uuid('shop_id')
      .notNull()
      .references(() => shopTable.id, { onDelete: 'cascade' }),
    productType: productTypeEnum('product_type').notNull(),
    categoryId: uuid('category_id').references(() => categoriesTable.id, {
      onDelete: 'set null',
    }),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    // Base variant reference - price is taken from this variant
    // FK added via migration (circular reference with product_variants)
    baseVariantId: uuid('base_variant_id'),
    thumbnailId: uuid('thumbnail_id').references(() => mediaTable.id, {
      onDelete: 'set null',
    }),
    status: productStatusEnum('status').default('DRAFT').notNull(),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index('products_shop_id_idx').on(t.shopId),
    index('products_product_type_idx').on(t.productType),
    index('products_category_id_idx').on(t.categoryId),
    index('products_status_idx').on(t.status),
  ],
);

export type TProduct = typeof productsTable.$inferSelect;
export type TNewProduct = typeof productsTable.$inferInsert;

export const productsRelations = relations(productsTable, ({ one }) => ({
  shop: one(shopTable, {
    fields: [productsTable.shopId],
    references: [shopTable.id],
  }),
  category: one(categoriesTable, {
    fields: [productsTable.categoryId],
    references: [categoriesTable.id],
  }),
  thumbnail: one(mediaTable, {
    fields: [productsTable.thumbnailId],
    references: [mediaTable.id],
  }),
}));
