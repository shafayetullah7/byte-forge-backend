import { pgTable, uuid, integer, boolean } from 'drizzle-orm/pg-core';
import { plantTable } from './plant.schema';

export const plantPricingTable = pgTable('plant_pricing', {
  id: uuid('id').defaultRandom().primaryKey(),
  plantId: uuid('plant_id')
    .references(() => plantTable.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  price: integer('price').notNull().default(0), // Regular price in cents
  salePrice: integer('sale_price'), // Sale price in cents
  costPrice: integer('cost_price'), // Cost price for internal calculation
  trackQuantity: boolean('track_quantity').default(true).notNull(),
  allowBackorders: boolean('allow_backorders').default(false).notNull(),
});

export type TPlantPricing = typeof plantPricingTable.$inferSelect;
export type TNewPlantPricing = typeof plantPricingTable.$inferInsert;
