import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';
import { shopBranchTable } from './shop.branch.schema';

export const shopBranchManagerTable = pgTable('shop_branch_manager', {
  id: uuid('id').defaultRandom().primaryKey(),

  shopBranchId: uuid('shop_branch_id')
    .notNull()
    .references(() => shopBranchTable.id, { onDelete: 'cascade' }),

  name: varchar('name', { length: 255 }).notNull(),
  workingSince: timestamp('working_since', {
    mode: 'date',
    withTimezone: true,
  }),

  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  alternativePhone: varchar('alternative_phone', { length: 20 }),
  whatsapp: varchar('whatsapp', { length: 20 }),
  telegram: varchar('telegram', { length: 20 }),

  verified: boolean('verified').default(false).notNull(),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type TShopBranchManager = typeof shopBranchManagerTable.$inferSelect;
export type TNewShopBranchManager = typeof shopBranchManagerTable.$inferInsert;
