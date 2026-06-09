export const LightRequirementEnum = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  BRIGHT_INDIRECT: 'BRIGHT_INDIRECT',
  DIRECT: 'DIRECT',
} as const;

export type TLightRequirement =
  (typeof LightRequirementEnum)[keyof typeof LightRequirementEnum];

export const WateringFrequencyEnum = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  BI_WEEKLY: 'BI_WEEKLY',
  MONTHLY: 'MONTHLY',
} as const;

export type TWateringFrequency =
  (typeof WateringFrequencyEnum)[keyof typeof WateringFrequencyEnum];

export const HumidityLevelEnum = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
} as const;

export const CareDifficultyEnum = {
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  EXPERT: 'EXPERT',
} as const;

export const GrowthRateEnum = {
  SLOW: 'SLOW',
  MODERATE: 'MODERATE',
  FAST: 'FAST',
} as const;

export type THumidityLevel =
  (typeof HumidityLevelEnum)[keyof typeof HumidityLevelEnum];

export type TCareDifficulty =
  (typeof CareDifficultyEnum)[keyof typeof CareDifficultyEnum];

export type TGrowthRate = (typeof GrowthRateEnum)[keyof typeof GrowthRateEnum];
