import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  integer,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { productVariantsTable } from './product-variants.schema';
import {
  GrowthStageEnum,
  PlantFormEnum,
  VariegationEnum,
  LeafDensityEnum,
  PropagationTypeEnum,
  ContainerTypeEnum,
} from '../../enum';

// === Database Enums ===
const GrowthStageDbEnum = pgEnum(
  'growth_stage_enum',
  Object.values(GrowthStageEnum) as [string, ...string[]],
);
const PlantFormDbEnum = pgEnum(
  'plant_form_enum',
  Object.values(PlantFormEnum) as [string, ...string[]],
);
const VariegationDbEnum = pgEnum(
  'variegation_enum',
  Object.values(VariegationEnum) as [string, ...string[]],
);
const LeafDensityDbEnum = pgEnum(
  'leaf_density_enum',
  Object.values(LeafDensityEnum) as [string, ...string[]],
);
const PropagationTypeDbEnum = pgEnum(
  'propagation_type_enum',
  Object.values(PropagationTypeEnum) as [string, ...string[]],
);
const ContainerTypeDbEnum = pgEnum(
  'container_type_enum',
  Object.values(ContainerTypeEnum) as [string, ...string[]],
);

/**
 * Plant Variant Attributes Table
 *
 * Stores plant-specific variant attributes (specimen morphology, container, etc.)
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
    // Growth & Morphology
    growthStage: GrowthStageDbEnum('growth_stage')
      .notNull()
      .default(GrowthStageEnum.JUVENILE),
    plantForm: PlantFormDbEnum('plant_form')
      .notNull()
      .default(PlantFormEnum.UPRIGHT),
    variegation: VariegationDbEnum('variegation')
      .notNull()
      .default(VariegationEnum.NONE),
    leafDensity: LeafDensityDbEnum('leaf_density')
      .notNull()
      .default(LeafDensityEnum.MODERATE),
    stemCount: integer('stem_count').default(1),
    currentHeight: varchar('current_height', { length: 50 }),
    currentSpread: varchar('current_spread', { length: 50 }),
    // Container & Packaging
    propagationType: PropagationTypeDbEnum('propagation_type')
      .notNull()
      .default(PropagationTypeEnum.CUTTING),
    containerType: ContainerTypeDbEnum('container_type')
      .notNull()
      .default(ContainerTypeEnum.NURSERY_POT),
    containerSize: varchar('container_size', { length: 50 }),
    bundleType: varchar('bundle_type', { length: 50 }),
  },
  (t) => [
    index('plant_variant_attributes_variant_id_idx').on(t.variantId),
    index('plant_variant_attributes_growth_stage_idx').on(t.growthStage),
    index('plant_variant_attributes_variegation_idx').on(t.variegation),
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
