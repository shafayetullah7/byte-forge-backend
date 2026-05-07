export const GrowthStageEnum = {
  SEEDLING: 'SEEDLING',
  JUVENILE: 'JUVENILE',
  MATURE: 'MATURE',
  CUTTING: 'CUTTING',
} as const;

export type TGrowthStage =
  (typeof GrowthStageEnum)[keyof typeof GrowthStageEnum];

export const PlantFormEnum = {
  UPRIGHT: 'UPRIGHT',
  TRAILING: 'TRAILING',
  BUSHY: 'BUSHY',
  CLIMBING: 'CLIMBING',
  ROSETTE: 'ROSETTE',
} as const;

export type TPlantForm = (typeof PlantFormEnum)[keyof typeof PlantFormEnum];

export const LeafDensityEnum = {
  SPARSE: 'SPARSE',
  MODERATE: 'MODERATE',
  DENSE: 'DENSE',
} as const;

export type TLeafDensity =
  (typeof LeafDensityEnum)[keyof typeof LeafDensityEnum];

export const VariegationEnum = {
  NONE: 'NONE',
  VARIEGATED: 'VARIEGATED',
  SEMI_VARIEGATED: 'SEMI_VARIEGATED',
  ALBO: 'ALBO',
  AUREO: 'AUREO',
} as const;

export type TVariegation =
  (typeof VariegationEnum)[keyof typeof VariegationEnum];

export const PropagationTypeEnum = {
  CUTTING: 'CUTTING',
  SEED: 'SEED',
  TISSUE_CULTURE: 'TISSUE_CULTURE',
  AIR_LAYER: 'AIR_LAYER',
  DIVISION: 'DIVISION',
} as const;

export type TPropagationType =
  (typeof PropagationTypeEnum)[keyof typeof PropagationTypeEnum];

export const ContainerTypeEnum = {
  NURSERY_POT: 'NURSERY_POT',
  DECORATIVE_POT: 'DECORATIVE_POT',
  HANGING_BASKET: 'HANGING_BASKET',
  TERRARIUM: 'TERRARIUM',
  GROW_BAG: 'GROW_BAG',
} as const;

export type TContainerType =
  (typeof ContainerTypeEnum)[keyof typeof ContainerTypeEnum];
