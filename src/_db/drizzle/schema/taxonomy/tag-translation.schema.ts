import { pgTable, uuid, varchar, text, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tagsTable } from './tag.schema';
import { languagesTable } from '../i18n/language.schema';

export const tagTranslationsTable = pgTable('tag_translations', {
  id: uuid('id').defaultRandom().primaryKey(),
  tagId: uuid('tag_id').notNull().references(() => tagsTable.id, { onDelete: 'cascade' }),
  locale: varchar('locale', { length: 10 }).notNull().references(() => languagesTable.code),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
}, (t) => [
  unique().on(t.tagId, t.locale),
]);

export type TTagTranslation = typeof tagTranslationsTable.$inferSelect;
export type TNewTagTranslation = typeof tagTranslationsTable.$inferInsert;

export const tagTranslationsRelations = relations(tagTranslationsTable, ({ one }) => ({
  tag: one(tagsTable, {
    fields: [tagTranslationsTable.tagId],
    references: [tagsTable.id],
  }),
  language: one(languagesTable, {
    fields: [tagTranslationsTable.locale],
    references: [languagesTable.code],
  }),
}));
