import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { ordersTable } from './orders.schema';

export const orderAddressTable = pgTable(
  'order_addresses',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orderId: uuid('order_id')
      .notNull()
      .unique()
      .references(() => ordersTable.id, { onDelete: 'cascade' }),
    recipientName: varchar('recipient_name', { length: 100 }).notNull(),
    phone: varchar('phone', { length: 20 }).notNull(),
    addressLine1: varchar('address_line1', { length: 255 }).notNull(),
    addressLine2: varchar('address_line2', { length: 255 }),
    city: varchar('city', { length: 100 }).notNull(),
    state: varchar('state', { length: 100 }),
    postalCode: varchar('postal_code', { length: 20 }),
    country: varchar('country', { length: 100 }).notNull().default('Bangladesh'),
    deliveryInstructions: text('delivery_instructions'),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index('order_addresses_order_id_idx').on(t.orderId),
  ],
);

export type TOrderAddress = typeof orderAddressTable.$inferSelect;
export type TNewOrderAddress = typeof orderAddressTable.$inferInsert;

export const orderAddressRelations = relations(orderAddressTable, ({ one }) => ({
  order: one(ordersTable, {
    fields: [orderAddressTable.orderId],
    references: [ordersTable.id],
  }),
}));
