import { pgTable, uuid, varchar, text } from 'drizzle-orm/pg-core';
import { plantTable } from './plant.schema';

export const plantCareTable = pgTable('plant_care', {
  id: uuid('id').defaultRandom().primaryKey(),
  plantId: uuid('plant_id')
    .references(() => plantTable.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  lightLevel: varchar('light_level', { length: 100 }), // e.g., Bright Indirect, Low Light
  wateringFrequency: varchar('watering_frequency', { length: 100 }),
  humidityLevel: varchar('humidity_level', { length: 100 }),
  tempRange: varchar('temp_range', { length: 100 }),
  soilType: varchar('soil_type', { length: 255 }),
  careDifficulty: varchar('care_difficulty', { length: 50 }), // Beginner, Intermediate, Expert
  petSafety: varchar('pet_safety', { length: 50 }), // Safe, Toxic
  fertilizerSchedule: text('fertilizer_schedule'),
  repottingFrequency: text('repotting_frequency'),
  pruningNotes: text('pruning_notes'),
});

export type TPlantCare = typeof plantCareTable.$inferSelect;
export type TNewPlantCare = typeof plantCareTable.$inferInsert;
