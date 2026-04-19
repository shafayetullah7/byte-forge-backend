import { pgEnum } from 'drizzle-orm/pg-core';

export const LightRequirementEnum = {
  LOW: 'low',
  MEDIUM: 'medium',
  BRIGHT_INDIRECT: 'bright_indirect',
  DIRECT: 'direct',
} as const;

export type TLightRequirement =
  (typeof LightRequirementEnum)[keyof typeof LightRequirementEnum];

export const WateringFrequencyEnum = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  BI_WEEKLY: 'bi_weekly',
  MONTHLY: 'monthly',
} as const;

export type TWateringFrequency =
  (typeof WateringFrequencyEnum)[keyof typeof WateringFrequencyEnum];

export const HumidityLevelEnum = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

export const CareDifficultyEnum = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  EXPERT: 'expert',
} as const;

export const GrowthRateEnum = {
  SLOW: 'slow',
  MODERATE: 'moderate',
  FAST: 'fast',
} as const;

export type THumidityLevel =
  (typeof HumidityLevelEnum)[keyof typeof HumidityLevelEnum];

export type TCareDifficulty =
  (typeof CareDifficultyEnum)[keyof typeof CareDifficultyEnum];

export type TGrowthRate = (typeof GrowthRateEnum)[keyof typeof GrowthRateEnum];
