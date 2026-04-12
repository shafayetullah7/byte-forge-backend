import { pgTable, uuid, varchar, integer, boolean, decimal, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { productVariantsTable } from './product-variants.schema';

export const fertilizerVariantAttributesTable = pgTable(
  'fertilizer_variant_attributes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    variantId: uuid('variant_id')
      .notNull()
      .unique()
      .references(() => productVariantsTable.id, { onDelete: 'cascade' }),
    volumeMl: integer('volume_ml'),
    volumeOz: decimal('volume_oz', { precision: 10, scale: 2 }),
    volumeLabel: varchar('volume_label', { length: 100 }),
    concentration: varchar('concentration', { length: 50 }),
    grade: varchar('grade', { length: 50 }),
    displayOrder: integer('display_order').default(0),
  },
  (t) => [
    index('fertilizer_variant_attributes_variant_id_idx').on(t.variantId),
    index('fertilizer_variant_attributes_volume_idx').on(t.volumeMl),
    index('fertilizer_variant_attributes_concentration_idx').on(t.concentration),
  ],
);

export type TFertilizerVariantAttributes = typeof fertilizerVariantAttributesTable.$inferSelect;
export type TNewFertilizerVariantAttributes = typeof fertilizerVariantAttributesTable.$inferInsert;

export const fertilizerVariantAttributesRelations = relations(
  fertilizerVariantAttributesTable,
  ({ one }) => ({
    variant: one(productVariantsTable, {
      fields: [fertilizerVariantAttributesTable.variantId],
      references: [productVariantsTable.id],
    }),
  }),
);
