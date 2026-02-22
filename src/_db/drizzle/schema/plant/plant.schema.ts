import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';
import { shopTable } from '../shop';
import { categoriesTable } from '../taxonomy/category.schema';
import { mediaTable } from '../media';

export const plantTable = pgTable('plants', {
  id: uuid('id').defaultRandom().primaryKey(),
  shopId: uuid('shop_id')
    .references(() => shopTable.id, { onDelete: 'cascade' })
    .notNull(),
  categoryId: uuid('category_id').references(() => categoriesTable.id, {
    onDelete: 'set null',
  }),

  // Basic Info
  name: varchar('name', { length: 255 }).notNull(),
  scientificName: varchar('scientific_name', { length: 255 }),
  sku: varchar('sku', { length: 100 }),
  description: text('description'),
  shortDescription: text('short_description'),
  isFeatured: boolean('is_featured').default(false).notNull(),
  status: varchar('status', { length: 20 }).default('draft').notNull(), // active, draft, archived

  mainImageId: uuid('main_image_id').references(() => mediaTable.id, {
    onDelete: 'set null',
  }),

  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type TPlant = typeof plantTable.$inferSelect;
export type TNewPlant = typeof plantTable.$inferInsert;
