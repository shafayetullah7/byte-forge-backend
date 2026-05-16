import {
  pgTable,
  uuid,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { userTable } from '../user/user.schema';
import { shopTable } from '../shop/shop.schema';
import { cartItemsTable } from './cart-items.schema';

export const cartsTable = pgTable(
  'carts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .unique()
      .references(() => userTable.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index('carts_user_id_idx').on(t.userId),
  ],
);

export type TCart = typeof cartsTable.$inferSelect;
export type TNewCart = typeof cartsTable.$inferInsert;

export const cartsRelations = relations(cartsTable, ({ one, many }) => ({
  user: one(userTable, {
    fields: [cartsTable.userId],
    references: [userTable.id],
  }),
  items: many(cartItemsTable),
}));
