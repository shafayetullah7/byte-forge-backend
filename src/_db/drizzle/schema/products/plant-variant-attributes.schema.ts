import {
  pgTable,
  uuid,
  varchar,
  integer,
  boolean,
  decimal,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { productVariantsTable } from './product-variants.schema';

/**
 * Plant Variant Attributes Table
 *
 * Stores plant-specific variant attributes (pot size, growth stage, etc.)
 * One-to-one relationship with product_variants
 */
export const plantVariantAttributesTable = pgTable(
  'plant_variant_attributes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    variantId: uuid('variant_id')
      .notNull()
      .unique()
      .references(() => productVariantsTable.id, { onDelete: 'cascade' }),
    // Size/Pot attributes
    potSize: varchar('pot_size', { length: 50 }),
    potSizeInches: decimal('pot_size_inches', { precision: 5, scale: 2 }),
    potMaterial: varchar('pot_material', { length: 50 }),
    potColorEn: varchar('pot_color_en', { length: 100 }),
    potColorBn: varchar('pot_color_bn', { length: 100 }),
    potType: varchar('pot_type', { length: 50 }),
    // Growth attributes
    growthStage: varchar('growth_stage', { length: 50 }),
    plantForm: varchar('plant_form', { length: 50 }),
    variegation: varchar('variegation', { length: 50 }),
    // Bundle attributes
    propagationType: varchar('propagation_type', { length: 50 }),
    containerType: varchar('container_type', { length: 50 }),
    bundleType: varchar('bundle_type', { length: 50 }),
    // Display
    displayOrder: integer('display_order').default(0),
  },
  (t) => [
    index('plant_variant_attributes_variant_id_idx').on(t.variantId),
    index('plant_variant_attributes_pot_size_idx').on(t.potSize),
    index('plant_variant_attributes_growth_stage_idx').on(t.growthStage),
    index('plant_variant_attributes_pot_material_idx').on(t.potMaterial),
  ],
);

export type TPlantVariantAttributes =
  typeof plantVariantAttributesTable.$inferSelect;
export type TNewPlantVariantAttributes =
  typeof plantVariantAttributesTable.$inferInsert;

export const plantVariantAttributesRelations = relations(
  plantVariantAttributesTable,
  ({ one }) => ({
    variant: one(productVariantsTable, {
      fields: [plantVariantAttributesTable.variantId],
      references: [productVariantsTable.id],
    }),
  }),
);
