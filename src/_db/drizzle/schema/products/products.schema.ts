import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  decimal,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { shopTable } from '../shop';
import { categoriesTable } from '../taxonomy/category.schema';
import { mediaTable } from '../media/media.schema';
import { productTypeEnum } from '../../enum/product-type.enum';

/**
 * Unified products table
 * Supports multiple product types: plant, pot, seed, fertilizer
 * 
 * For plants: uses plant_care, plant_seo, plant_media, plant_variants, plant_translations
 * For pots: uses pot_details
 * For seeds: uses seed_details
 * For fertilizers: uses fertilizer_details
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
    basePrice: decimal('base_price', { precision: 10, scale: 2 }),
    thumbnailId: uuid('thumbnail_id').references(() => mediaTable.id, {
      onDelete: 'set null',
    }),
    isFeatured: boolean('is_featured').default(false).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    status: varchar('status', { length: 20 }).default('draft').notNull(),
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

export const productsRelations = relations(productsTable, ({ one, many }) => ({
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
