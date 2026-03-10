import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';
import { plantTable } from './plant.schema';

export const plantVariantTable = pgTable('plant_variants', {
  id: uuid('id').defaultRandom().primaryKey(),
  plantId: uuid('plant_id')
    .references(() => plantTable.id, { onDelete: 'cascade' })
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(), // Small, Medium, Large, Rooted Cutting, etc.
  sku: varchar('sku', { length: 100 }),

  // Differentiating Attributes (Individual typed fields)
  potSize: varchar('pot_size', { length: 50 }),
  plantHeight: integer('plant_height'), // Height in cm
  growthStage: varchar('growth_stage', { length: 50 }),
  propagationType: varchar('propagation_type', { length: 50 }),
  plantForm: varchar('plant_form', { length: 50 }),
  variegation: varchar('variegation', { length: 50 }),
  containerType: varchar('container_type', { length: 50 }),
  bundleType: varchar('bundle_type', { length: 50 }),

  // Pricing (Moved from plant_pricing)
  price: integer('price').notNull().default(0), // Regular price in cents
  salePrice: integer('sale_price'), // Sale price in cents
  costPrice: integer('cost_price'), // Cost price for internal calculation
  
  // Inventory (Moved from plant_inventory)
  stockCount: integer('stock_count').notNull().default(0),
  trackQuantity: boolean('track_quantity').default(true).notNull(),
  lowStockAlert: integer('low_stock_alert').default(5),
  
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type TPlantVariant = typeof plantVariantTable.$inferSelect;
export type TNewPlantVariant = typeof plantVariantTable.$inferInsert;
