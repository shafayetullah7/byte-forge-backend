import {
  pgTable,
  uuid,
  integer,
  boolean,
  varchar,
  numeric,
} from 'drizzle-orm/pg-core';
import { plantTable } from './plant.schema';

export const plantInventoryTable = pgTable('plant_inventory', {
  id: uuid('id').defaultRandom().primaryKey(),
  plantId: uuid('plant_id')
    .references(() => plantTable.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  stockCount: integer('stock_count').notNull().default(0),
  lowStockAlert: integer('low_stock_alert').default(5),
  supplier: varchar('supplier', { length: 255 }),
  storageLocation: varchar('storage_location', { length: 255 }),
  weight: numeric('weight', { precision: 10, scale: 2 }), // in lbs or kg
  length: numeric('length', { precision: 10, scale: 2 }), // in inches or cm
  width: numeric('width', { precision: 10, scale: 2 }),
  height: numeric('height', { precision: 10, scale: 2 }),
  shippingClass: varchar('shipping_class', { length: 100 }),
  specialHandling: boolean('special_handling').default(false).notNull(),
});

export type TPlantInventory = typeof plantInventoryTable.$inferSelect;
export type TNewPlantInventory = typeof plantInventoryTable.$inferInsert;
