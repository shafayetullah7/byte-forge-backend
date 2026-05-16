import {
  pgTable,
  uuid,
  integer,
  timestamp,
  index,
  check,
  unique,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import { cartsTable } from './carts.schema';
import { productVariantsTable } from '../products/product-variants.schema';

export const cartItemsTable = pgTable(
  'cart_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    cartId: uuid('cart_id')
      .notNull()
      .references(() => cartsTable.id, { onDelete: 'cascade' }),
    variantId: uuid('variant_id')
      .notNull()
      .references(() => productVariantsTable.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull().default(1),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    check('cart_items_quantity_check', sql`${t.quantity} > 0`),
    index('cart_items_cart_id_idx').on(t.cartId),
    index('cart_items_variant_id_idx').on(t.variantId),
    unique().on(t.cartId, t.variantId),
  ],
);

export type TCartItem = typeof cartItemsTable.$inferSelect;
export type TNewCartItem = typeof cartItemsTable.$inferInsert;

export const cartItemsRelations = relations(cartItemsTable, ({ one }) => ({
  cart: one(cartsTable, {
    fields: [cartItemsTable.cartId],
    references: [cartsTable.id],
  }),
  variant: one(productVariantsTable, {
    fields: [cartItemsTable.variantId],
    references: [productVariantsTable.id],
  }),
}));
