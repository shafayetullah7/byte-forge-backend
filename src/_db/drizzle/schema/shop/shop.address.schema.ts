import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  decimal,
  text,
} from 'drizzle-orm/pg-core';
import { shopTable } from './shop.schema';
import { relations } from 'drizzle-orm';
import { shopAddressTranslationsTable } from './shop.address.translation.schema';

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

  // Google Maps Location
  latitude: decimal('latitude', { precision: 13, scale: 10 }), // GPS coordinates for map location (-90 to 90)
  longitude: decimal('longitude', { precision: 14, scale: 10 }), // GPS coordinates for map location (-180 to 180)
  googleMapsLink: text('google_maps_link'), // Direct Google Maps URL for easy navigation

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

export const shopAddressRelations = relations(
  shopAddressTable,
  ({ one, many }) => ({
    shop: one(shopTable, {
      fields: [shopAddressTable.shopId],
      references: [shopTable.id],
    }),
    translations: many(shopAddressTranslationsTable),
  }),
);
