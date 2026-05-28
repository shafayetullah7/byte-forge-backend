import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { divisionTranslationsTable } from './division.translation.schema';
import { districtsTable } from './district.schema';

export const divisionsTable = pgTable('divisions', {
  id: uuid('id').defaultRandom().primaryKey(),
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

export type TDivision = typeof divisionsTable.$inferSelect;
export type TNewDivision = typeof divisionsTable.$inferInsert;

export const divisionsRelations = relations(divisionsTable, ({ many }) => ({
  translations: many(divisionTranslationsTable),
  districts: many(districtsTable),
}));
