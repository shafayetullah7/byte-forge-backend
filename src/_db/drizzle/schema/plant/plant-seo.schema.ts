import { pgTable, uuid, varchar, text } from 'drizzle-orm/pg-core';
import { plantTable } from './plant.schema';

export const plantSeoTable = pgTable('plant_seo', {
  id: uuid('id').defaultRandom().primaryKey(),
  plantId: uuid('plant_id')
    .references(() => plantTable.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  metaTitle: varchar('meta_title', { length: 100 }),
  metaDescription: varchar('meta_description', { length: 255 }),
  slug: varchar('slug', { length: 255 }),
  focusKeywords: text('focus_keywords'),
  internalNotes: text('internal_notes'),
});

export type TPlantSeo = typeof plantSeoTable.$inferSelect;
export type TNewPlantSeo = typeof plantSeoTable.$inferInsert;
