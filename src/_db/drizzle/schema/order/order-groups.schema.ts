import {
  pgTable,
  uuid,
  timestamp,
  decimal,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { userTable } from '../user/user.schema';
import { ordersTable } from '../order/orders.schema';

export const orderGroupsTable = pgTable(
  'order_groups',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
    totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index('order_groups_user_id_idx').on(t.userId),
    index('order_groups_created_at_idx').on(t.createdAt),
  ],
);

export type TOrderGroup = typeof orderGroupsTable.$inferSelect;
export type TNewOrderGroup = typeof orderGroupsTable.$inferInsert;

export const orderGroupsRelations = relations(
  orderGroupsTable,
  ({ one, many }) => ({
    user: one(userTable, {
      fields: [orderGroupsTable.userId],
      references: [userTable.id],
    }),
    orders: many(ordersTable),
  }),
);
