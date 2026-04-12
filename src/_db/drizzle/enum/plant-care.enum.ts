import { pgEnum } from 'drizzle-orm/pg-core';

/**
 * Light Requirement ENUM
 * Used for filtering plants by light needs
 */
export const lightRequirementEnum = pgEnum('light_requirement_enum', [
  'low',
  'medium',
  'bright_indirect',
  'direct',
]);

/**
 * Watering Frequency ENUM
 * Used for filtering plants by watering needs
 */
export const wateringFrequencyEnum = pgEnum('watering_frequency_enum', [
  'daily',
  'weekly',
  'bi_weekly',
  'monthly',
]);

/**
 * Humidity Level ENUM
 * Used for filtering plants by humidity needs
 */
export const humidityLevelEnum = pgEnum('humidity_level_enum', [
  'low',
  'medium',
  'high',
]);

/**
 * Care Difficulty ENUM
 * Used for filtering plants by care level
 */
export const careDifficultyEnum = pgEnum('care_difficulty_enum', [
  'beginner',
  'intermediate',
  'expert',
]);

/**
 * Growth Rate ENUM
 * Used for filtering plants by growth speed
 */
export const growthRateEnum = pgEnum('growth_rate_enum', [
  'slow',
  'moderate',
  'fast',
]);
