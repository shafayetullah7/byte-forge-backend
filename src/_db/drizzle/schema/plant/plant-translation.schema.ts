import { pgTable, uuid, varchar, text, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { plantTable } from './plant.schema';
import { languagesTable } from '../i18n/language.schema';

export const plantTranslationsTable = pgTable(
  'plant_translations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    plantId: uuid('plant_id')
      .references(() => plantTable.id, { onDelete: 'cascade' })
      .notNull(),
    locale: varchar('locale', { length: 10 })
      .notNull()
      .references(() => languagesTable.code),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    shortDescription: text('short_description'),
  },
  (t) => [unique().on(t.plantId, t.locale)],
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
    language: one(languagesTable, {
      fields: [plantTranslationsTable.locale],
      references: [languagesTable.code],
    }),
  }),
);
