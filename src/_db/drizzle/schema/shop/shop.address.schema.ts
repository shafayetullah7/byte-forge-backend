import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';
import { shopTable } from './shop.schema';

export const shopAddressTable = pgTable('shop_address', {
  id: uuid('id').defaultRandom().primaryKey(),

  shopId: uuid('shop_id')
    .notNull()
    .unique() // one address per shop
    .references(() => shopTable.id, { onDelete: 'cascade' }),

  country: varchar('country', { length: 100 }).notNull(),
  division: varchar('division', { length: 100 }).notNull(),
  district: varchar('district', { length: 100 }).notNull(),
  street: varchar('street', { length: 255 }).notNull(),
  postalCode: varchar('postal_code', { length: 20 }).notNull(),

  isVerified: boolean('is_verified').default(false).notNull(), // simple verified flag

  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Types
export type TShopAddress = typeof shopAddressTable.$inferSelect;
export type TNewShopAddress = typeof shopAddressTable.$inferInsert;
