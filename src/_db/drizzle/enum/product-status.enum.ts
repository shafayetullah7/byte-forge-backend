import { pgEnum } from 'drizzle-orm/pg-core';

export const ProductStatusEnum = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
} as const;



export type TProductStatus = (typeof ProductStatusEnum)[keyof typeof ProductStatusEnum];
