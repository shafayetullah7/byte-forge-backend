import { pgTable, uuid, varchar, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { plantVariantTable } from './plant-variant.schema';
import { languagesTable } from '../i18n/language.schema';

/**
 * Plant Variant Translations Table
 *
 * This table stores translated display labels for plant variant attributes.
 * Following the English-as-Default pattern:
 * - Main table (plant_variants) stores English values
 * - This table stores non-English locale translations only
 *
 * Translatable fields: name, growthStage, propagationType, plantForm, variegation, containerType, bundleType
 */
export const plantVariantTranslationsTable = pgTable(
  'plant_variant_translations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    variantId: uuid('variant_id')
      .notNull()
      .references(() => plantVariantTable.id, { onDelete: 'cascade' }),
    locale: varchar('locale', { length: 10 })
      .notNull()
      .references(() => languagesTable.code),

    // Translated display labels
    // These override the English values from main table for specific locales
    name: varchar('name', { length: 255 }),
    growthStage: varchar('growth_stage', { length: 50 }),
    propagationType: varchar('propagation_type', { length: 50 }),
    plantForm: varchar('plant_form', { length: 50 }),
    variegation: varchar('variegation', { length: 50 }),
    containerType: varchar('container_type', { length: 50 }),
    bundleType: varchar('bundle_type', { length: 50 }),
  },
  (t) => [unique().on(t.variantId, t.locale)],
);

export type TPlantVariantTranslation =
  typeof plantVariantTranslationsTable.$inferSelect;
export type TNewPlantVariantTranslation =
  typeof plantVariantTranslationsTable.$inferInsert;

export const plantVariantTranslationsRelations = relations(
  plantVariantTranslationsTable,
  ({ one }) => ({
    variant: one(plantVariantTable, {
      fields: [plantVariantTranslationsTable.variantId],
      references: [plantVariantTable.id],
    }),
    language: one(languagesTable, {
      fields: [plantVariantTranslationsTable.locale],
      references: [languagesTable.code],
    }),
  }),
);
