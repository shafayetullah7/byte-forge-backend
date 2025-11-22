import { pgTable, uuid, boolean, timestamp } from 'drizzle-orm/pg-core';
import { managerTable } from './manager.schema';
import { shopTable } from './shop.schema';

export const shopManagerTable = pgTable('shop_manager', {
  id: uuid('id').defaultRandom().primaryKey(),

  shopId: uuid('shop_id')
    .notNull()
    .references(() => shopTable.id, { onDelete: 'cascade' }),

  managerId: uuid('manager_id')
    .notNull()
    .unique() // ensures a manager can belong to only one shop
    .references(() => managerTable.id, { onDelete: 'cascade' }),

  isPrimary: boolean('is_primary').default(false).notNull(), // primary manager flag

  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Types
export type TShopManager = typeof shopManagerTable.$inferSelect;
export type TNewShopManager = typeof shopManagerTable.$inferInsert;
