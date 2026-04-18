import { pgTable, uuid, varchar, text, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { plantCareInstructionsTable } from './plant-care-instructions.schema';
import { languagesTable } from '../i18n/language.schema';

/**
 * Plant Care Translations Table
 * 
 * Stores bilingual care instructions.
 * Each care instruction has one row per locale (en, bn).
 */
export const plantCareTranslationsTable = pgTable(
  'plant_care_translations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    careId: uuid('care_id')
      .notNull()
      .references(() => plantCareInstructionsTable.id, { onDelete: 'cascade' }),
    locale: varchar('locale', { length: 2 })
      .notNull()
      .references(() => languagesTable.code),
    
    // Translated care instructions
    lightInstructions: text('light_instructions'),
    wateringInstructions: text('watering_instructions'),
    humidityInstructions: text('humidity_instructions'),
    fertilizerSchedule: text('fertilizer_schedule'),
    repottingFrequency: text('repotting_frequency'),
    pruningNotes: text('pruning_notes'),
    commonProblems: text('common_problems'),
    seasonalCare: text('seasonal_care'),
  },
  (t) => [unique().on(t.careId, t.locale)],
);

export type TPlantCareTranslation = typeof plantCareTranslationsTable.$inferSelect;
export type TNewPlantCareTranslation = typeof plantCareTranslationsTable.$inferInsert;

export const plantCareTranslationsRelations = relations(
  plantCareTranslationsTable,
  ({ one }) => ({
    care: one(plantCareInstructionsTable, {
      fields: [plantCareTranslationsTable.careId],
      references: [plantCareInstructionsTable.id],
    }),
    language: one(languagesTable, {
      fields: [plantCareTranslationsTable.locale],
      references: [languagesTable.code],
    }),
  }),
);
