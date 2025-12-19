import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core';
import { plantTable } from './plant.schema';

export const plantVariantTable = pgTable('plant_variants', {
  id: uuid('id').defaultRandom().primaryKey(),
  plantId: uuid('plant_id')
    .references(() => plantTable.id, { onDelete: 'cascade' })
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(), // Small, Medium, Large, Rooted Cutting, etc.
  sku: varchar('sku', { length: 100 }),
  price: integer('price').notNull().default(0),
  stockCount: integer('stock_count').notNull().default(0),
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
