import {
  pgTable,
  uuid,
  varchar,
  integer,
  decimal,
  timestamp,
  json,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { ordersTable } from './orders.schema';
import { productVariantsTable } from '../products/product-variants.schema';
import { productsTable } from '../products/products.schema';

export const orderItemsTable = pgTable(
  'order_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => ordersTable.id, { onDelete: 'cascade' }),
    variantId: uuid('variant_id')
      .notNull()
      .references(() => productVariantsTable.id, { onDelete: 'restrict' }),
    productId: uuid('product_id')
      .notNull()
      .references(() => productsTable.id, { onDelete: 'restrict' }),
    productName: varchar('product_name', { length: 255 }).notNull(),
    variantTitle: varchar('variant_title', { length: 255 }),
    sku: varchar('sku', { length: 100 }),
    unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
    quantity: integer('quantity').notNull(),
    subtotal: decimal('subtotal', { precision: 12, scale: 2 }).notNull(),
    variantSnapshot: json('variant_snapshot'),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index('order_items_order_id_idx').on(t.orderId),
    index('order_items_product_id_idx').on(t.productId),
    index('order_items_variant_id_idx').on(t.variantId),
  ],
);

export type TOrderItem = typeof orderItemsTable.$inferSelect;
export type TNewOrderItem = typeof orderItemsTable.$inferInsert;

export const orderItemsRelations = relations(orderItemsTable, ({ one }) => ({
  order: one(ordersTable, {
    fields: [orderItemsTable.orderId],
    references: [ordersTable.id],
  }),
  variant: one(productVariantsTable, {
    fields: [orderItemsTable.variantId],
    references: [productVariantsTable.id],
  }),
  product: one(productsTable, {
    fields: [orderItemsTable.productId],
    references: [productsTable.id],
  }),
}));
