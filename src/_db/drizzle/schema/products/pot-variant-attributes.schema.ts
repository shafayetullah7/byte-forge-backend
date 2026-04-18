import { pgTable, uuid, varchar, integer, boolean, decimal, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { productVariantsTable } from './product-variants.schema';

export const potVariantAttributesTable = pgTable(
  'pot_variant_attributes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    variantId: uuid('variant_id')
      .notNull()
      .unique()
      .references(() => productVariantsTable.id, { onDelete: 'cascade' }),
    diameterInches: decimal('diameter_inches', { precision: 5, scale: 2 }),
    diameterCm: decimal('diameter_cm', { precision: 5, scale: 2 }),
    heightInches: decimal('height_inches', { precision: 5, scale: 2 }),
    heightCm: decimal('height_cm', { precision: 5, scale: 2 }),
    sizeLabel: varchar('size_label', { length: 100 }),
    colorEn: varchar('color_en', { length: 100 }),
    colorBn: varchar('color_bn', { length: 100 }),
    finish: varchar('finish', { length: 50 }),
    material: varchar('material', { length: 50 }),
    displayOrder: integer('display_order').default(0),
  },
  (t) => [
    index('pot_variant_attributes_variant_id_idx').on(t.variantId),
    index('pot_variant_attributes_diameter_idx').on(t.diameterInches),
    index('pot_variant_attributes_material_idx').on(t.material),
    index('pot_variant_attributes_color_idx').on(t.colorEn),
  ],
);

export type TPotVariantAttributes = typeof potVariantAttributesTable.$inferSelect;
export type TNewPotVariantAttributes = typeof potVariantAttributesTable.$inferInsert;

export const potVariantAttributesRelations = relations(
  potVariantAttributesTable,
  ({ one }) => ({
    variant: one(productVariantsTable, {
      fields: [potVariantAttributesTable.variantId],
      references: [productVariantsTable.id],
    }),
  }),
);
