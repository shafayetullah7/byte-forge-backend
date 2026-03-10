import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { shopTable } from '../shop';
import { categoriesTable } from '../taxonomy/category.schema';
import { plantCareTable } from './plant-care.schema';
import { plantSeoTable } from './plant-seo.schema';
import { plantMediaTable } from './plant-media.schema';
import { plantVariantTable } from './plant-variant.schema';
import { plantTranslationsTable } from './plant-translation.schema';

export const plantTable = pgTable('plants', {
  id: uuid('id').defaultRandom().primaryKey(),
  shopId: uuid('shop_id')
    .references(() => shopTable.id, { onDelete: 'cascade' })
    .notNull(),
  categoryId: uuid('category_id').references(() => categoriesTable.id, {
    onDelete: 'set null',
  }),

  // Basic Info (Non-localized)
  scientificName: varchar('scientific_name', { length: 255 }),
  isFeatured: boolean('is_featured').default(false).notNull(),
  status: varchar('status', { length: 20 }).default('draft').notNull(), // active, draft, archived

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

export const plantRelations = relations(plantTable, ({ one, many }) => ({
  shop: one(shopTable, {
    fields: [plantTable.shopId],
    references: [shopTable.id],
  }),
  category: one(categoriesTable, {
    fields: [plantTable.categoryId],
    references: [categoriesTable.id],
  }),
  care: one(plantCareTable, {
    fields: [plantTable.id],
    references: [plantCareTable.plantId],
  }),
  seo: one(plantSeoTable, {
    fields: [plantTable.id],
    references: [plantSeoTable.plantId],
  }),
  media: many(plantMediaTable),
  variants: many(plantVariantTable),
  translations: many(plantTranslationsTable),
}));
