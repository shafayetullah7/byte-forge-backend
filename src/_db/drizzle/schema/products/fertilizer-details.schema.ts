import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { productsTable } from './products.schema';

/**
 * Fertilizer-specific product details
 * For products with product_type = 'fertilizer'
 */
export const fertilizerDetailsTable = pgTable('fertilizer_details', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id')
    .notNull()
    .unique()
    .references(() => productsTable.id, { onDelete: 'cascade' }),
  npkRatio: varchar('npk_ratio', { length: 20 }), // e.g., "10-10-10"
  nitrogen: varchar('nitrogen', { length: 10 }), // N percentage
  phosphorus: varchar('phosphorus', { length: 10 }), // P percentage
  potassium: varchar('potassium', { length: 10 }), // K percentage
  fertilizerType: varchar('fertilizer_type', { length: 50 }), // Liquid, Granular, Powder
  fertilizerTypeEn: varchar('fertilizer_type_en', { length: 50 }),
  fertilizerTypeBn: varchar('fertilizer_type_bn', { length: 50 }),
  applicationFrequency: varchar('application_frequency', { length: 100 }), // Weekly, Monthly
  applicationFrequencyEn: varchar('application_frequency_en', { length: 100 }),
  applicationFrequencyBn: varchar('application_frequency_bn', { length: 100 }),
  volume: varchar('volume', { length: 50 }), // e.g., "500ml", "1kg"
  coverage: varchar('coverage', { length: 100 }), // e.g., "Covers 100 sq ft"
  organic: varchar('organic', { length: 20 }), // Yes, No, Certified Organic
  indoor: varchar('indoor', { length: 20 }), // Yes, No
  outdoor: varchar('outdoor', { length: 20 }), // Yes, No
});

export type TFertilizerDetails = typeof fertilizerDetailsTable.$inferSelect;
export type TNewFertilizerDetails = typeof fertilizerDetailsTable.$inferInsert;

export const fertilizerDetailsRelations = relations(
  fertilizerDetailsTable,
  ({ one }) => ({
    product: one(productsTable, {
      fields: [fertilizerDetailsTable.productId],
      references: [productsTable.id],
    }),
  }),
);
