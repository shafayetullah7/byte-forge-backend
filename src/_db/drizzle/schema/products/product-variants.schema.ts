import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  boolean,
  decimal,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { productsTable } from './products.schema';

/**
 * Product Variants Table
 *
 * EVERY product must have at least ONE variant.
 * Cart and Orders reference this table ONLY.
 *
 * The base/default variant is tracked in products.baseVariantId
 *
 * Type-specific attributes are stored in:
 * - plant_variant_attributes
 * - pot_variant_attributes
 * - seed_variant_attributes
 * - fertilizer_variant_attributes
 */
export const productVariantsTable = pgTable(
  'product_variants',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    productId: uuid('product_id')
      .notNull()
      .references(() => productsTable.id, { onDelete: 'cascade' }),
    sku: varchar('sku', { length: 100 }).unique(),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    salePrice: decimal('sale_price', { precision: 10, scale: 2 }),
    costPrice: decimal('cost_price', { precision: 10, scale: 2 }),
    inventoryCount: integer('inventory_count').default(0),
    trackInventory: boolean('track_inventory').default(true).notNull(),
    lowStockThreshold: integer('low_stock_threshold').default(5),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index('product_variants_product_id_idx').on(t.productId),
    index('product_variants_sku_idx').on(t.sku),
    index('product_variants_price_idx').on(t.price),
    index('product_variants_inventory_idx').on(t.inventoryCount),
    index('product_variants_is_active_idx').on(t.isActive),
  ],
);

export type TProductVariant = typeof productVariantsTable.$inferSelect;
export type TNewProductVariant = typeof productVariantsTable.$inferInsert;

export const productVariantsRelations = relations(
  productVariantsTable,
  ({ one }) => ({
    product: one(productsTable, {
      fields: [productVariantsTable.productId],
      references: [productsTable.id],
    }),
  }),
);
