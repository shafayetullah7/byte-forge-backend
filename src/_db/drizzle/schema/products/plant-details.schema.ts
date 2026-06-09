import {
  pgTable,
  uuid,
  varchar,
  text,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { productsTable } from './products.schema';
import { plantDetailsTranslationsTable } from './plant-details-translations.schema';
import { plantDetailsTagsTable } from './plant-details-tags.schema';
import { categoriesTable } from '../taxonomy/category.schema';
import {
  CareDifficultyEnum,
  GrowthRateEnum,
  HumidityLevelEnum,
  LightRequirementEnum,
  WateringFrequencyEnum,
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

export const careDifficultyEnum = pgEnum('care_difficulty_enum', [
  CareDifficultyEnum.BEGINNER,
  CareDifficultyEnum.INTERMEDIATE,
  CareDifficultyEnum.EXPERT,
]);

export const humidityLevelEnum = pgEnum('humidity_level_enum', [
  HumidityLevelEnum.LOW,
  HumidityLevelEnum.MEDIUM,
  HumidityLevelEnum.HIGH,
]);

export const growthRateEnum = pgEnum('growth_rate_enum', [
  GrowthRateEnum.SLOW,
  GrowthRateEnum.MODERATE,
  GrowthRateEnum.FAST,
]);

export const lightRequirementEnum = pgEnum('light_requirement_enum', [
  LightRequirementEnum.LOW,
  LightRequirementEnum.MEDIUM,
  LightRequirementEnum.BRIGHT_INDIRECT,
  LightRequirementEnum.DIRECT,
]);

export const wateringFrequencyEnum = pgEnum('watering_frequency_enum', [
  WateringFrequencyEnum.DAILY,
  WateringFrequencyEnum.WEEKLY,
  WateringFrequencyEnum.BI_WEEKLY,
  WateringFrequencyEnum.MONTHLY,
]);

export const plantDetailsTable = pgTable(
  'plant_details',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    productId: uuid('product_id')
      .notNull()
      .unique()
      .references(() => productsTable.id, { onDelete: 'cascade' }),

    // Category (plant-specific taxonomy)
    categoryId: uuid('category_id').references(() => categoriesTable.id, {
      onDelete: 'set null',
    }),

    // Scientific/Classification (no translation needed)
    scientificName: varchar('scientific_name', { length: 255 }),
    commonNames: text('common_names'), // Base language (English)

    // Origin (translated)
    origin: varchar('origin', { length: 255 }), // Base language (English)

    // Care Requirements (ENUM values - no translation, used for filtering)
    lightRequirement: lightRequirementEnum('light_requirement'), // low, medium, bright_indirect, direct
    wateringFrequency: wateringFrequencyEnum('watering_frequency'), // daily, weekly, bi_weekly, monthly
    humidityLevel: humidityLevelEnum('humidity_level'), // low, medium, high
    temperatureRange: varchar('temperature_range', { length: 100 }), // "10-30°C"
    soilType: varchar('soil_type', { length: 255 }), // Base language (English)

    // Difficulty & Growth (ENUM values - no translation, used for filtering)
    careDifficulty: careDifficultyEnum('care_difficulty'), // beginner, intermediate, expert
    growthRate: growthRateEnum('growth_rate'), // slow, moderate, fast

    // Size at Maturity (measurements - same in both languages)
    matureHeight: varchar('mature_height', { length: 100 }), // "1-2 meters"
    matureSpread: varchar('mature_spread', { length: 100 }), // "0.5-1 meter"

    // Toxicity (translated)
    toxicityInfo: text('toxicity_info'), // Base language (English)
  },
  (t) => [
    index('plant_details_product_id_idx').on(t.productId),
    index('plant_details_category_id_idx').on(t.categoryId),
    // Indexes for common filters
    index('plant_details_light_requirement_idx').on(t.lightRequirement),
    index('plant_details_watering_frequency_idx').on(t.wateringFrequency),
    index('plant_details_care_difficulty_idx').on(t.careDifficulty),
  ],
);

export type TPlantDetails = typeof plantDetailsTable.$inferSelect;
export type TNewPlantDetails = typeof plantDetailsTable.$inferInsert;

export const plantDetailsRelations = relations(
  plantDetailsTable,
  ({ one, many }) => ({
    product: one(productsTable, {
      fields: [plantDetailsTable.productId],
      references: [productsTable.id],
    }),
    category: one(categoriesTable, {
      fields: [plantDetailsTable.categoryId],
      references: [categoriesTable.id],
    }),
    translations: many(plantDetailsTranslationsTable),
    tags: many(plantDetailsTagsTable),
  }),
);
