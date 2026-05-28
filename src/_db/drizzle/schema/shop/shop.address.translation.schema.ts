import { pgTable, uuid, varchar, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { shopAddressTable } from './shop.address.schema';
import { languagesTable } from '../i18n/language.schema';

/**
 * Shop Address Translations Table
 *
 * Stores bilingual content (country, division, district, street) for shop addresses.
 * Each address has one row per locale (en, bn).
 *
 * Pattern: Matches product_translations and shop_translations
 *
 * Translatable fields: country, division, district, street
 * Non-translatable fields (in main table): postalCode, latitude, longitude, googleMapsLink
 */
export const shopAddressTranslationsTable = pgTable(
  'shop_address_translations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    addressId: uuid('address_id')
      .notNull()
      .references(() => shopAddressTable.id, { onDelete: 'cascade' }),
    locale: varchar('locale', { length: 10 })
      .notNull()
      .references(() => languagesTable.code),

    // ALL translatable fields (required for each locale)
    country: varchar('country', { length: 100 }).notNull(),
    division: varchar('division', { length: 100 }).notNull(),
    district: varchar('district', { length: 100 }).notNull(),
    street: varchar('street', { length: 255 }).notNull(),
  },
  (t) => [
    unique('shop_address_translations_address_locale_unique').on(
      t.addressId,
      t.locale,
    ),
  ],
);

export type TShopAddressTranslation =
  typeof shopAddressTranslationsTable.$inferSelect;
export type TNewShopAddressTranslation =
  typeof shopAddressTranslationsTable.$inferInsert;

export const shopAddressTranslationsRelations = relations(
  shopAddressTranslationsTable,
  ({ one }) => ({
    address: one(shopAddressTable, {
      fields: [shopAddressTranslationsTable.addressId],
      references: [shopAddressTable.id],
    }),
    language: one(languagesTable, {
      fields: [shopAddressTranslationsTable.locale],
      references: [languagesTable.code],
    }),
  }),
);
