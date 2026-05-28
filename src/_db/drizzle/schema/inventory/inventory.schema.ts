import {
  pgTable,
  uuid,
  integer,
  boolean,
  timestamp,
  check,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import { productVariantsTable } from '../products/product-variants.schema';
import { shopTable } from '../shop/shop.schema';
import { inventoryMovementsTable } from './inventory-movements.schema';

/**
 * Inventory Table
 *
 * Source of truth for stock levels per variant.
 * Separated from product_variants so inventory has its own lifecycle
 * and can be tracked independently with a full audit trail.
 *
 * available_quantity = quantity - reserved_quantity (computed, not stored)
 */
export const inventoryTable = pgTable(
  'inventory',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    variantId: uuid('variant_id')
      .notNull()
      .unique()
      .references(() => productVariantsTable.id, { onDelete: 'cascade' }),
    shopId: uuid('shop_id')
      .notNull()
      .references(() => shopTable.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull().default(0),
    reservedQuantity: integer('reserved_quantity')
      .notNull()
      .default(0),
    lowStockThreshold: integer('low_stock_threshold').notNull().default(5),
    trackInventory: boolean('track_inventory').notNull().default(true),
    allowBackorder: boolean('allow_backorder').notNull().default(false),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    check('inventory_quantity_check', sql`${t.quantity} >= 0`),
    check('inventory_reserved_check', sql`${t.reservedQuantity} >= 0`),
    check(
      'inventory_reserved_lte_quantity',
      sql`${t.reservedQuantity} <= ${t.quantity}`,
    ),
    check('inventory_threshold_check', sql`${t.lowStockThreshold} >= 0`),
    index('inventory_variant_id_idx').on(t.variantId),
    index('inventory_shop_id_idx').on(t.shopId),
    index('inventory_track_inventory_idx').on(t.trackInventory),
  ],
);

export type TInventory = typeof inventoryTable.$inferSelect;
export type TNewInventory = typeof inventoryTable.$inferInsert;

export const inventoryRelations = relations(
  inventoryTable,
  ({ one, many }) => ({
    variant: one(productVariantsTable, {
      fields: [inventoryTable.variantId],
      references: [productVariantsTable.id],
    }),
    shop: one(shopTable, {
      fields: [inventoryTable.shopId],
      references: [shopTable.id],
    }),
    movements: many(inventoryMovementsTable),
  }),
);
