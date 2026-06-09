import { pgTable, uuid, varchar, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { districtsTable } from './district.schema';
import { languagesTable } from '../i18n/language.schema';

export const districtTranslationsTable = pgTable(
  'district_translations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    districtId: uuid('district_id')
      .notNull()
      .references(() => districtsTable.id, { onDelete: 'cascade' }),
    locale: varchar('locale', { length: 10 })
      .notNull()
      .references(() => languagesTable.code),
    name: varchar('name', { length: 100 }).notNull(),
  },
  (t) => [unique().on(t.districtId, t.locale)],
);

export type TDistrictTranslation =
  typeof districtTranslationsTable.$inferSelect;
export type TNewDistrictTranslation =
  typeof districtTranslationsTable.$inferInsert;

export const districtTranslationsRelations = relations(
  districtTranslationsTable,
  ({ one }) => ({
    district: one(districtsTable, {
      fields: [districtTranslationsTable.districtId],
      references: [districtsTable.id],
    }),
    language: one(languagesTable, {
      fields: [districtTranslationsTable.locale],
      references: [languagesTable.code],
    }),
  }),
);
