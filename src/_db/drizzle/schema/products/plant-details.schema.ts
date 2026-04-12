import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { productsTable } from './products.schema';
import { plantDetailsTranslationsTable } from './plant-details-translations.schema';
import {
  lightRequirementEnum,
  wateringFrequencyEnum,
  humidityLevelEnum,
  careDifficultyEnum,
  growthRateEnum,
} from '../../enum/plant-care.enum';

/**
 * Plant Details Table
 * 
 * Stores plant-specific attributes.
 * - ENUM/numeric/boolean fields stored here (for filtering)
 * - English values for translatable text fields
 * - Translated values stored in plant_details_translations
 * 
 * One-to-one relationship with products (where product_type = 'plant')
 */
export const plantDetailsTable = pgTable(
  'plant_details',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    productId: uuid('product_id')
      .notNull()
      .unique()
      .references(() => productsTable.id, { onDelete: 'cascade' }),
    
    // Scientific/Classification (no translation needed)
    scientificName: varchar('scientific_name', { length: 255 }),
    commonNamesEn: text('common_names_en'),  // English names
    
    // Origin (translated)
    originEn: varchar('origin_en', { length: 255 }),  // English
    
    // Care Requirements (ENUM values - no translation, used for filtering)
    lightRequirement: lightRequirementEnum('light_requirement'),  // low, medium, bright_indirect, direct
    wateringFrequency: wateringFrequencyEnum('watering_frequency'),  // daily, weekly, bi_weekly, monthly
    humidityLevel: humidityLevelEnum('humidity_level'),  // low, medium, high
    temperatureRange: varchar('temperature_range', { length: 100 }),  // "10-30°C"
    soilTypeEn: varchar('soil_type_en', { length: 255 }),  // English
    
    // Difficulty & Growth (ENUM values - no translation, used for filtering)
    careDifficulty: careDifficultyEnum('care_difficulty'),  // beginner, intermediate, expert
    growthRate: growthRateEnum('growth_rate'),  // slow, moderate, fast
    
    // Size at Maturity (measurements - same in both languages)
    matureHeight: varchar('mature_height', { length: 100 }),  // "1-2 meters"
    matureSpread: varchar('mature_spread', { length: 100 }),  // "0.5-1 meter"
    
    // Toxicity (translated)
    toxicityInfoEn: text('toxicity_info_en'),  // English
  },
  (t) => [
    index('plant_details_product_id_idx').on(t.productId),
    // Indexes for common filters
    index('plant_details_light_requirement_idx').on(t.lightRequirement),
    index('plant_details_watering_frequency_idx').on(t.wateringFrequency),
    index('plant_details_care_difficulty_idx').on(t.careDifficulty),
  ],
);

export type TPlantDetails = typeof plantDetailsTable.$inferSelect;
export type TNewPlantDetails = typeof plantDetailsTable.$inferInsert;

export const plantDetailsRelations = relations(plantDetailsTable, ({ one, many }) => ({
  product: one(productsTable, {
    fields: [plantDetailsTable.productId],
    references: [productsTable.id],
  }),
  translations: many(plantDetailsTranslationsTable),
}));
