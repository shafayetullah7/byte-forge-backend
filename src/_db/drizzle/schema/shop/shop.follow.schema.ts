import { pgTable, uuid, timestamp, index, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { shopTable } from './shop.schema';
import { userTable } from '../user/user.schema';

export const shopFollowsTable = pgTable(
  'shop_follows',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    shopId: uuid('shop_id')
      .notNull()
      .references(() => shopTable.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    unique().on(t.shopId, t.userId),
    index('shop_follows_shop_id_idx').on(t.shopId),
    index('shop_follows_user_id_idx').on(t.userId),
  ],
);

export type TShopFollow = typeof shopFollowsTable.$inferSelect;
export type TNewShopFollow = typeof shopFollowsTable.$inferInsert;

export const shopFollowsRelations = relations(shopFollowsTable, ({ one }) => ({
  shop: one(shopTable, {
    fields: [shopFollowsTable.shopId],
    references: [shopTable.id],
  }),
  user: one(userTable, {
    fields: [shopFollowsTable.userId],
    references: [userTable.id],
  }),
}));
