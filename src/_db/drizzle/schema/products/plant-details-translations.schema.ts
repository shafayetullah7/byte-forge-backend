import { pgTable, uuid, varchar, text, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { plantDetailsTable } from './plant-details.schema';
import { languagesTable } from '../i18n/language.schema';

/**
 * Plant Details Translations Table
 *
 * Stores ONLY translatable fields from plant_details.
 * Each plant has one row per locale (en, bn) for translated text fields.
 *
 * Non-translatable fields (ENUM, boolean, numeric) stay in plant_details only.
 */
export const plantDetailsTranslationsTable = pgTable(
  'plant_details_translations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    plantId: uuid('plant_id')
      .notNull()
      .references(() => plantDetailsTable.id, { onDelete: 'cascade' }),
    locale: varchar('locale', { length: 2 })
      .notNull()
      .references(() => languagesTable.code),

    // Translatable text fields only
    commonNames: text('common_names'),
    origin: varchar('origin', { length: 255 }),
    soilType: varchar('soil_type', { length: 255 }),
    toxicityInfo: text('toxicity_info'),
  },
  (t) => [unique().on(t.plantId, t.locale)],
);

export type TPlantDetailsTranslation =
  typeof plantDetailsTranslationsTable.$inferSelect;
export type TNewPlantDetailsTranslation =
  typeof plantDetailsTranslationsTable.$inferInsert;

export const plantDetailsTranslationsRelations = relations(
  plantDetailsTranslationsTable,
  ({ one }) => ({
    plant: one(plantDetailsTable, {
      fields: [plantDetailsTranslationsTable.plantId],
      references: [plantDetailsTable.id],
    }),
    language: one(languagesTable, {
      fields: [plantDetailsTranslationsTable.locale],
      references: [languagesTable.code],
    }),
  }),
);
