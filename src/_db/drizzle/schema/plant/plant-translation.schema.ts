import { pgTable, uuid, varchar, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { plantTable } from './plant.schema';

export const plantTranslationsTable = pgTable(
  'plant_translations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    plantId: uuid('plant_id')
      .references(() => plantTable.id, { onDelete: 'cascade' })
      .notNull(),
    locale: varchar('locale', { length: 10 }).notNull(), // 'en', 'bn', etc.
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    shortDescription: text('short_description'),
  },
  (table) => ({
    plantLocaleIdx: uniqueIndex('plant_locale_idx').on(table.plantId, table.locale),
  }),
);

export type TPlantTranslation = typeof plantTranslationsTable.$inferSelect;
export type TNewPlantTranslation = typeof plantTranslationsTable.$inferInsert;

export const plantTranslationsRelations = relations(
  plantTranslationsTable,
  ({ one }) => ({
    plant: one(plantTable, {
      fields: [plantTranslationsTable.plantId],
      references: [plantTable.id],
    }),
  }),
);
