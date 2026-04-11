import { pgEnum } from 'drizzle-orm/pg-core';

export const ProductTypeEnum = {
  PLANT: 'plant',
  POT: 'pot',
  SEED: 'seed',
  FERTILIZER: 'fertilizer',
} as const;

export const productTypeEnum = pgEnum('product_type_enum', [
  ProductTypeEnum.PLANT,
  ProductTypeEnum.POT,
  ProductTypeEnum.SEED,
  ProductTypeEnum.FERTILIZER,
]);

export type TProductType = (typeof ProductTypeEnum)[keyof typeof ProductTypeEnum];
