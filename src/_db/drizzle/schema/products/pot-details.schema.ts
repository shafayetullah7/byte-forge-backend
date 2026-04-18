import { pgTable, uuid, varchar, integer, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { productsTable } from './products.schema';

/**
 * Pot/Planter-specific product details
 * For products with product_type = 'pot'
 */
export const potDetailsTable = pgTable('pot_details', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id')
    .notNull()
    .unique()
    .references(() => productsTable.id, { onDelete: 'cascade' }),
  material: varchar('material', { length: 50 }), // Ceramic, Plastic, Terracotta, etc.
  materialEn: varchar('material_en', { length: 50 }), // For bilingual display
  materialBn: varchar('material_bn', { length: 50 }),
  sizeInches: integer('size_inches'), // Diameter in inches
  heightInches: integer('height_inches'),
  drainage: boolean('drainage').default(true),
  drainageHoles: integer('drainage_holes'), // Number of drainage holes
  colorEn: varchar('color_en', { length: 50 }),
  colorBn: varchar('color_bn', { length: 50 }),
  weight: varchar('weight', { length: 50 }), // e.g., "500g"
  indoor: boolean('indoor').default(true),
  outdoor: boolean('outdoor').default(true),
});

export type TPotDetails = typeof potDetailsTable.$inferSelect;
export type TNewPotDetails = typeof potDetailsTable.$inferInsert;

export const potDetailsRelations = relations(potDetailsTable, ({ one }) => ({
  product: one(productsTable, {
    fields: [potDetailsTable.productId],
    references: [productsTable.id],
  }),
}));
