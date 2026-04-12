import { pgTable, uuid, varchar, integer, decimal, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { productVariantsTable } from './product-variants.schema';

export const seedVariantAttributesTable = pgTable(
  'seed_variant_attributes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    variantId: uuid('variant_id')
      .notNull()
      .unique()
      .references(() => productVariantsTable.id, { onDelete: 'cascade' }),
    packetSizeLabel: varchar('packet_size_label', { length: 100 }),
    seedsPerPacket: integer('seeds_per_packet'),
    packetWeightGrams: decimal('packet_weight_grams', { precision: 10, scale: 2 }),
    treatment: varchar('treatment', { length: 50 }),
    grade: varchar('grade', { length: 50 }),
    displayOrder: integer('display_order').default(0),
  },
  (t) => [
    index('seed_variant_attributes_variant_id_idx').on(t.variantId),
    index('seed_variant_attributes_seeds_per_packet_idx').on(t.seedsPerPacket),
    index('seed_variant_attributes_treatment_idx').on(t.treatment),
  ],
);

export type TSeedVariantAttributes = typeof seedVariantAttributesTable.$inferSelect;
export type TNewSeedVariantAttributes = typeof seedVariantAttributesTable.$inferInsert;

export const seedVariantAttributesRelations = relations(
  seedVariantAttributesTable,
  ({ one }) => ({
    variant: one(productVariantsTable, {
      fields: [seedVariantAttributesTable.variantId],
      references: [productVariantsTable.id],
    }),
  }),
);
