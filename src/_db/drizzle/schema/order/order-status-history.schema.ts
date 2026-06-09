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
import { userTable } from '../user/user.schema';

export const orderStatusHistoryTable = pgTable(
  'order_status_history',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => ordersTable.id, { onDelete: 'cascade' }),
    fromStatus: varchar('from_status', { length: 50 }),
    toStatus: varchar('to_status', { length: 50 }).notNull(),
    notes: text('notes'),
    changedBy: uuid('changed_by').references(() => userTable.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index('order_status_history_order_id_idx').on(t.orderId),
    index('order_status_history_created_at_idx').on(t.orderId, t.createdAt),
  ],
);

export type TOrderStatusHistory = typeof orderStatusHistoryTable.$inferSelect;
export type TNewOrderStatusHistory =
  typeof orderStatusHistoryTable.$inferInsert;

export const orderStatusHistoryRelations = relations(
  orderStatusHistoryTable,
  ({ one }) => ({
    order: one(ordersTable, {
      fields: [orderStatusHistoryTable.orderId],
      references: [ordersTable.id],
    }),
    changedByUser: one(userTable, {
      fields: [orderStatusHistoryTable.changedBy],
      references: [userTable.id],
    }),
  }),
);
