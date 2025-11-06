import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core';
import { shopBranchTable } from './shop.branch.schema';

export const shopBranchBusinessTable = pgTable('shop_branch_business', {
  id: uuid('id').defaultRandom().primaryKey(),

  shopBranchId: uuid('shop_branch_id')
    .notNull()
    .unique() // one business info per branch
    .references(() => shopBranchTable.id, { onDelete: 'cascade' }),

  businessHours: text('business_hours').notNull(),
  localDelivery: boolean('local_delivery').default(false).notNull(),
  nationwideShipping: boolean('nationwide_shipping').default(false).notNull(),
  inStorePickup: boolean('in_store_pickup').default(false).notNull(),
  internationalShipping: boolean('international_shipping')
    .default(false)
    .notNull(),

  deliveryAreaDescription: text('delivery_area_description').notNull(),
  minimumDeliveryTime: varchar('minimum_delivery_time', {
    length: 50,
  }).notNull(),

  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type TShopBranchBusiness = typeof shopBranchBusinessTable.$inferSelect;
export type TNewShopBranchBusiness =
  typeof shopBranchBusinessTable.$inferInsert;
