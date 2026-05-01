export const GrowthStageEnum = {
  SEEDLING: 'seedling',
  JUVENILE: 'juvenile',
  MATURE: 'mature',
  CUTTING: 'cutting',
} as const;

export type TGrowthStage =
  (typeof GrowthStageEnum)[keyof typeof GrowthStageEnum];

export const PlantFormEnum = {
  UPRIGHT: 'upright',
  TRAILING: 'trailing',
  BUSHY: 'bushy',
  CLIMBING: 'climbing',
  ROSETTE: 'rosette',
} as const;

export type TPlantForm = (typeof PlantFormEnum)[keyof typeof PlantFormEnum];

export const LeafDensityEnum = {
  SPARSE: 'sparse',
  MODERATE: 'moderate',
  DENSE: 'dense',
} as const;

export type TLeafDensity =
  (typeof LeafDensityEnum)[keyof typeof LeafDensityEnum];

export const VariegationEnum = {
  NONE: 'none',
  VARIEGATED: 'variegated',
  SEMI_VARIEGATED: 'semi_variegated',
  ALBO: 'albo',
  AUREO: 'aureo',
} as const;

export type TVariegation =
  (typeof VariegationEnum)[keyof typeof VariegationEnum];

export const PropagationTypeEnum = {
  CUTTING: 'cutting',
  SEED: 'seed',
  TISSUE_CULTURE: 'tissue_culture',
  AIR_LAYER: 'air_layer',
  DIVISION: 'division',
} as const;

export type TPropagationType =
  (typeof PropagationTypeEnum)[keyof typeof PropagationTypeEnum];

export const ContainerTypeEnum = {
  NURSERY_POT: 'nursery_pot',
  DECORATIVE_POT: 'decorative_pot',
  HANGING_BASKET: 'hanging_basket',
  TERRARIUM: 'terrarium',
  GROW_BAG: 'grow_bag',
} as const;

export type TContainerType =
  (typeof ContainerTypeEnum)[keyof typeof ContainerTypeEnum];
