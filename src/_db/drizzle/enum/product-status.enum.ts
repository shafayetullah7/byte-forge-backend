import { pgEnum } from 'drizzle-orm/pg-core';

/**
 * Product Status Enum
 * 
 * Tracks publication/moderation state only.
 * Inventory status is tracked at variant level via inventoryCount.
 */
export const ProductStatusEnum = {
  DRAFT: 'DRAFT',       // Not published
  ACTIVE: 'ACTIVE',     // Published and visible
  ARCHIVED: 'ARCHIVED', // Soft deleted/hidden by seller
} as const;

export type TProductStatus =
  (typeof ProductStatusEnum)[keyof typeof ProductStatusEnum];
