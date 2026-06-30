import { pgTable, uuid, timestamp, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { userTable } from '../user/user.schema';
import { wishlistItemsTable } from './wishlist-items.schema';

export const wishlistsTable = pgTable(
  'wishlists',
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
);

export type TWishlist = typeof wishlistsTable.$inferSelect;
export type TNewWishlist = typeof wishlistsTable.$inferInsert;

export const wishlistsRelations = relations(wishlistsTable, ({ one, many }) => ({
  user: one(userTable, {
    fields: [wishlistsTable.userId],
    references: [userTable.id],
  }),
  items: many(wishlistItemsTable),
}));
