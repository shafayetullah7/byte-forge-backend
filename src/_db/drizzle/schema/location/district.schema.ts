import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { divisionsTable } from './division.schema';
import { districtTranslationsTable } from './district.translation.schema';

export const districtsTable = pgTable('districts', {
  id: uuid('id').defaultRandom().primaryKey(),
  divisionId: uuid('division_id')
    .notNull()
    .references(() => divisionsTable.id, { onDelete: 'cascade' }),
  code: varchar('code', { length: 10 }).notNull().unique(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type TDistrict = typeof districtsTable.$inferSelect;
export type TNewDistrict = typeof districtsTable.$inferInsert;

export const districtsRelations = relations(districtsTable, ({ one, many }) => ({
  division: one(divisionsTable, {
    fields: [districtsTable.divisionId],
    references: [divisionsTable.id],
  }),
  translations: many(districtTranslationsTable),
}));
