import { pgTable, uuid, text, timestamp, integer, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { productsTable } from './products.schema';
import { plantCareTranslationsTable } from './plant-care-translations.schema';

/**
 * Plant Care Instructions Table
 * 
 * Stores detailed care instructions for plants (English).
 * One-to-one relationship with products (where product_type = 'plant').
 * 
 * Translations stored in plant_care_translations table.
 */
export const plantCareInstructionsTable = pgTable(
  'plant_care_instructions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    productId: uuid('product_id')
      .notNull()
      .unique()
      .references(() => productsTable.id, { onDelete: 'cascade' }),
    
    // Care Instructions (English)
    lightInstructions: text('light_instructions'),
    wateringInstructions: text('watering_instructions'),
    humidityInstructions: text('humidity_instructions'),
    fertilizerSchedule: text('fertilizer_schedule'),
    repottingFrequency: text('repotting_frequency'),
    pruningNotes: text('pruning_notes'),
    commonProblems: text('common_problems'),
    seasonalCare: text('seasonal_care'),
    
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index('plant_care_instructions_product_id_idx').on(t.productId),
  ],
);

export type TPlantCareInstructions = typeof plantCareInstructionsTable.$inferSelect;
export type TNewPlantCareInstructions = typeof plantCareInstructionsTable.$inferInsert;

export const plantCareInstructionsRelations = relations(
  plantCareInstructionsTable,
  ({ one, many }) => ({
    product: one(productsTable, {
      fields: [plantCareInstructionsTable.productId],
      references: [productsTable.id],
    }),
    translations: many(plantCareTranslationsTable),
  }),
);
