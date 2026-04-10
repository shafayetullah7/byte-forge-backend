import { pgTable, uuid, varchar, text, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { categoriesTable } from './category.schema';
import { languagesTable } from '../i18n/language.schema';

export const categoryTranslationsTable = pgTable('category_translations', {
  id: uuid('id').defaultRandom().primaryKey(),
  categoryId: uuid('category_id').notNull().references(() => categoriesTable.id, { onDelete: 'cascade' }),
  locale: varchar('locale', { length: 10 }).notNull().references(() => languagesTable.code),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
}, (t) => [
  unique().on(t.categoryId, t.locale),
]);

export type TCategoryTranslation = typeof categoryTranslationsTable.$inferSelect;
export type TNewCategoryTranslation = typeof categoryTranslationsTable.$inferInsert;

export const categoryTranslationsRelations = relations(categoryTranslationsTable, ({ one }) => ({
  category: one(categoriesTable, {
    fields: [categoryTranslationsTable.categoryId],
    references: [categoriesTable.id],
  }),
  language: one(languagesTable, {
    fields: [categoryTranslationsTable.locale],
    references: [languagesTable.code],
  }),
}));
