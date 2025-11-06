import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { shopTable } from './shop.schema';

export const shopBranchTable = pgTable('shop_branch', {
  id: uuid().defaultRandom().primaryKey(),
  shopId: uuid('shop_id')
    .notNull()
    .references(() => shopTable.id, { onDelete: 'cascade' }),
  branchName: varchar('branch_name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type TShopBranch = typeof shopBranchTable.$inferSelect;
export type TNewShopBranch = typeof shopBranchTable.$inferInsert;
