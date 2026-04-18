import { pgTable, uuid, varchar, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { productsTable } from './products.schema';

/**
 * Seed-specific product details
 * For products with product_type = 'seed'
 */
export const seedDetailsTable = pgTable('seed_details', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id')
    .notNull()
    .unique()
    .references(() => productsTable.id, { onDelete: 'cascade' }),
  germinationDays: integer('germination_days'), // Days to germinate
  germinationMin: integer('germination_min'),
  germinationMax: integer('germination_max'),
  plantingSeasonEn: varchar('planting_season_en', { length: 100 }), // Spring, Fall, etc.
  plantingSeasonBn: varchar('planting_season_bn', { length: 100 }),
  seedsPerPacket: integer('seeds_per_packet'),
  packetWeight: varchar('packet_weight', { length: 50 }), // e.g., "10g"
  seedType: varchar('seed_type', { length: 50 }), // Heirloom, Hybrid, Organic
  seedTypeEn: varchar('seed_type_en', { length: 50 }),
  seedTypeBn: varchar('seed_type_bn', { length: 50 }),
  harvestDays: integer('harvest_days'), // Days to harvest
  harvestDaysMin: integer('harvest_days_min'),
  harvestDaysMax: integer('harvest_days_max'),
  sunlightRequirement: varchar('sunlight_requirement', { length: 50 }),
  sunlightRequirementEn: varchar('sunlight_requirement_en', { length: 50 }),
  sunlightRequirementBn: varchar('sunlight_requirement_bn', { length: 50 }),
});

export type TSeedDetails = typeof seedDetailsTable.$inferSelect;
export type TNewSeedDetails = typeof seedDetailsTable.$inferInsert;

export const seedDetailsRelations = relations(seedDetailsTable, ({ one }) => ({
  product: one(productsTable, {
    fields: [seedDetailsTable.productId],
    references: [productsTable.id],
  }),
}));
