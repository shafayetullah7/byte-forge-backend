import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core';
import { shopTable } from './shop.schema';

export const shopBusinessTable = pgTable('shop_business', {
  id: uuid('id').defaultRandom().primaryKey(),

  shopId: uuid('shop_id')
    .notNull()
    .unique() // one business info per shop
    .references(() => shopTable.id, { onDelete: 'cascade' }),

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

// Types
export type TShopBusiness = typeof shopBusinessTable.$inferSelect;
export type TNewShopBusiness = typeof shopBusinessTable.$inferInsert;
