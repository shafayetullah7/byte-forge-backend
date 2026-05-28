import { pgTable, uuid, varchar, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { divisionsTable } from './division.schema';
import { languagesTable } from '../i18n/language.schema';

export const divisionTranslationsTable = pgTable(
  'division_translations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    divisionId: uuid('division_id')
      .notNull()
      .references(() => divisionsTable.id, { onDelete: 'cascade' }),
    locale: varchar('locale', { length: 10 })
      .notNull()
      .references(() => languagesTable.code),
    name: varchar('name', { length: 100 }).notNull(),
  },
  (t) => [unique().on(t.divisionId, t.locale)],
);

export type TDivisionTranslation = typeof divisionTranslationsTable.$inferSelect;
export type TNewDivisionTranslation = typeof divisionTranslationsTable.$inferInsert;

export const divisionTranslationsRelations = relations(
  divisionTranslationsTable,
  ({ one }) => ({
    division: one(divisionsTable, {
      fields: [divisionTranslationsTable.divisionId],
      references: [divisionsTable.id],
    }),
    language: one(languagesTable, {
      fields: [divisionTranslationsTable.locale],
      references: [languagesTable.code],
    }),
  }),
);
