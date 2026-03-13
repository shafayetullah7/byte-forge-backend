import { pgTable, uuid, varchar, text, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { shopAddressTable } from './shop.address.schema';
import { languagesTable } from '../i18n/language.schema';

/**
 * Shop Address Translations Table
 *
 * This table stores translated display labels for shop address fields.
 * Following the English-as-Default pattern:
 * - Main table (shop_address) stores English values
 * - This table stores non-English locale translations only
 *
 * Translatable fields: country, division, district, street
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

    // Translated address fields
    // These override the English values from main table for specific locales
    // Can be null for partial translations - missing fields will fall back to English values
    // Currently supports 'bn' (Bengali) translations; English values are stored in main table
    country: varchar('country', { length: 100 }),
    division: varchar('division', { length: 100 }),
    district: varchar('district', { length: 100 }),
    street: varchar('street', { length: 255 }),
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
