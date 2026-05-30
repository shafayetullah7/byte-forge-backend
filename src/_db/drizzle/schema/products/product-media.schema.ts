import {
  pgTable,
  uuid,
  integer,
  varchar,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { productsTable } from './products.schema';
import { productVariantsTable } from './product-variants.schema';
import { mediaTable } from '../media/media.schema';
import { ProductMediaTypeEnum } from '../../enum';

export const productMediaTypeEnum = pgEnum('product_media_type_enum', [
  ProductMediaTypeEnum.IMAGE,
  ProductMediaTypeEnum.VIDEO,
]);

/**
 * Product Media Table
 *
 * Links products to media (images/videos)
 * Can be linked to a specific variant or to the product in general
 */
export const productMediaTable = pgTable(
  'product_media',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    productId: uuid('product_id')
      .notNull()
      .references(() => productsTable.id, { onDelete: 'cascade' }),
    variantId: uuid('variant_id').references(() => productVariantsTable.id, {
      onDelete: 'set null',
    }),
    mediaId: uuid('media_id')
      .notNull()
      .references(() => mediaTable.id, { onDelete: 'cascade' }),
    displayOrder: integer('display_order').default(0).notNull(),
    type: productMediaTypeEnum('type')
      .notNull()
      .default(ProductMediaTypeEnum.IMAGE),
  },
  (t) => [
    index('product_media_product_id_idx').on(t.productId),
    index('product_media_variant_id_idx').on(t.variantId),
  ],
);

export type TProductMedia = typeof productMediaTable.$inferSelect;
export type TNewProductMedia = typeof productMediaTable.$inferInsert;

export const productMediaRelations = relations(productMediaTable, ({ one }) => ({
  product: one(productsTable, {
    fields: [productMediaTable.productId],
    references: [productsTable.id],
  }),
  variant: one(productVariantsTable, {
    fields: [productMediaTable.variantId],
    references: [productVariantsTable.id],
  }),
  media: one(mediaTable, {
    fields: [productMediaTable.mediaId],
    references: [mediaTable.id],
  }),
}));
