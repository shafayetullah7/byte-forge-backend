import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { shopBranchTable } from './shop.branch.schema';

export const shopBranchContactTable = pgTable('shop_branch_contact', {
  id: uuid('id').defaultRandom().notNull(),
  shopBranchId: uuid('shop_branch_id')
    .notNull()
    .unique()
    .references(() => shopBranchTable.id),
  businessEmail: varchar('business_email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  alternativePhone: varchar('alternative_phone', { length: 20 }),
  whatsapp: varchar('whatsapp', { length: 20 }),
  telegram: varchar('telegram', { length: 50 }),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type TShopBranchContact = typeof shopBranchContactTable.$inferSelect;
export type TNewShopBranchContact = typeof shopBranchContactTable.$inferInsert;
