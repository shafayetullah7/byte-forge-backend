import { pgTable, uuid, varchar, text, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { plantCareTable } from './plant-care.schema';
import { languagesTable } from '../i18n/language.schema';

/**
 * Plant Care Translations Table
 *
 * This table stores translated display labels for plant care attributes.
 * Following the English-as-Default pattern:
 * - Main table (plant_care) stores English values
 * - This table stores non-English locale translations only
 *
 * Translatable fields: lightLevel, wateringFrequency, humidityLevel, tempRange, soilType, careDifficulty, petSafety, fertilizerSchedule, repottingFrequency, pruningNotes
 */
export const plantCareTranslationsTable = pgTable(
  'plant_care_translations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    careId: uuid('care_id')
      .notNull()
      .references(() => plantCareTable.id, { onDelete: 'cascade' }),
    locale: varchar('locale', { length: 10 })
      .notNull()
      .references(() => languagesTable.code),

    // Translated display labels
    // These override the English values from main table for specific locales
    lightLevel: varchar('light_level', { length: 100 }),
    wateringFrequency: varchar('watering_frequency', { length: 100 }),
    humidityLevel: varchar('humidity_level', { length: 100 }),
    tempRange: varchar('temp_range', { length: 100 }),
    soilType: varchar('soil_type', { length: 255 }),
    careDifficulty: varchar('care_difficulty', { length: 50 }),
    petSafety: varchar('pet_safety', { length: 50 }),
    fertilizerSchedule: text('fertilizer_schedule'),
    repottingFrequency: text('repotting_frequency'),
    pruningNotes: text('pruning_notes'),
  },
  (t) => [unique().on(t.careId, t.locale)],
);

export type TPlantCareTranslation =
  typeof plantCareTranslationsTable.$inferSelect;
export type TNewPlantCareTranslation =
  typeof plantCareTranslationsTable.$inferInsert;

export const plantCareTranslationsRelations = relations(
  plantCareTranslationsTable,
  ({ one }) => ({
    care: one(plantCareTable, {
      fields: [plantCareTranslationsTable.careId],
      references: [plantCareTable.id],
    }),
    language: one(languagesTable, {
      fields: [plantCareTranslationsTable.locale],
      references: [languagesTable.code],
    }),
  }),
);
