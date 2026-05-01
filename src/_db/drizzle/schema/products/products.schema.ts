import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { shopTable } from '../shop';
import { mediaTable } from '../media/media.schema';
import { ProductStatusEnum, ProductTypeEnum } from '../../enum';
import { productVariantsTable } from './product-variants.schema';
import { productTranslationsTable } from './product-translations.schema';
import { productMediaTable } from './product-media.schema';
import { plantDetailsTable } from './plant-details.schema';
import { plantCareInstructionsTable } from './plant-care-instructions.schema';

/**
 * Unified Products Table
 *
 * Supports multiple product types: plant, pot, seed, fertilizer
 * Every product must have at least one variant (marked with isBase = true)
 *
 * @see product_variants - Cart/Orders reference this table
 * @see product_translations - Bilingual content
 * @see product_tags - Flexible filtering
 */

export const productTypeEnum = pgEnum('product_type_enum', [
  ProductTypeEnum.PLANT,
  ProductTypeEnum.POT,
  ProductTypeEnum.SEED,
  ProductTypeEnum.FERTILIZER,
]);

export const productStatusEnum = pgEnum('product_status_enum', [
  ProductStatusEnum.DRAFT,
  ProductStatusEnum.ACTIVE,
  ProductStatusEnum.ARCHIVED,
]);

export const productsTable = pgTable(
  'products',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    shopId: uuid('shop_id')
      .notNull()
      .references(() => shopTable.id, { onDelete: 'cascade' }),
    productType: productTypeEnum('product_type').notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    thumbnailId: uuid('thumbnail_id').references(() => mediaTable.id, {
      onDelete: 'set null',
    }),
    status: productStatusEnum('status').default('DRAFT').notNull(),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index('products_shop_id_idx').on(t.shopId),
    index('products_product_type_idx').on(t.productType),
    index('products_status_idx').on(t.status),
  ],
);

export type TProduct = typeof productsTable.$inferSelect;
export type TNewProduct = typeof productsTable.$inferInsert;

export const productsRelations = relations(productsTable, ({ one, many }) => ({
  shop: one(shopTable, {
    fields: [productsTable.shopId],
    references: [shopTable.id],
  }),
  thumbnail: one(mediaTable, {
    fields: [productsTable.thumbnailId],
    references: [mediaTable.id],
  }),
  variants: many(productVariantsTable),
  translations: many(productTranslationsTable),
  media: many(productMediaTable),
  plantDetails: one(plantDetailsTable, {
    fields: [productsTable.id],
    references: [plantDetailsTable.productId],
  }),
  careInstructions: one(plantCareInstructionsTable, {
    fields: [productsTable.id],
    references: [plantCareInstructionsTable.productId],
  }),
}));
