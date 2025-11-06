import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { shopBranchTable } from './shop.branch.schema';

export const shopBranchAddressTable = pgTable('shop_branch_address', {
  id: uuid('id').defaultRandom().primaryKey(),
  shopBranchId: uuid('shop_branch_id')
    .notNull()
    .unique()
    .references(() => shopBranchTable.id, { onDelete: 'cascade' }),
  country: varchar('country', { length: 100 }).notNull(),
  division: varchar('division', { length: 100 }).notNull(),
  district: varchar('district', { length: 100 }).notNull(),
  street: varchar('street', { length: 255 }).notNull(),
  postalCode: varchar('postal_code', { length: 20 }).notNull(),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedtAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type TShopBranchAddress = typeof shopBranchAddressTable.$inferSelect;
export type TNewShopBranchAddress = typeof shopBranchAddressTable.$inferInsert;
