import {
  pgTable,
  uuid,
  integer,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { shopTable } from './shop.schema';

export const shopValuePointsTable = pgTable(
  'shop_value_points',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    shopId: uuid('shop_id')
      .notNull()
      .references(() => shopTable.id, { onDelete: 'cascade' }),
    displayOrder: integer('display_order').notNull().default(0),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index('shop_value_points_shop_display_order_idx').on(
      t.shopId,
      t.displayOrder,
    ),
  ],
);

export type TShopValuePoint = typeof shopValuePointsTable.$inferSelect;
export type TNewShopValuePoint = typeof shopValuePointsTable.$inferInsert;
