export const ProductTypeEnum = {
  PLANT: 'plant',
  POT: 'pot',
  SEED: 'seed',
  FERTILIZER: 'fertilizer',
} as const;

export type TProductType =
  (typeof ProductTypeEnum)[keyof typeof ProductTypeEnum];
