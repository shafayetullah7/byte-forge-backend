import { pgEnum } from 'drizzle-orm/pg-core';

export const productStatusEnum = pgEnum('product_status_enum', [
  'DRAFT',
  'ACTIVE',
  'ARCHIVED',
  'OUT_OF_STOCK',
]);

export type TProductStatus = (typeof productStatusEnum)['enumValues'][number];
