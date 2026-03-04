import { pgTable, uuid, varchar, text, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tagGroupsTable } from './tag-group.schema';
import { languagesTable } from '../i18n/language.schema';

export const tagGroupTranslationsTable = pgTable('tag_group_translations', {
  id: uuid('id').defaultRandom().primaryKey(),
  groupId: uuid('group_id').notNull().references(() => tagGroupsTable.id, { onDelete: 'cascade' }),
  locale: varchar('locale', { length: 10 }).notNull().references(() => languagesTable.code),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
}, (t) => [
  unique().on(t.groupId, t.locale),
]);

export type TTagGroupTranslation = typeof tagGroupTranslationsTable.$inferSelect;
export type TNewTagGroupTranslation = typeof tagGroupTranslationsTable.$inferInsert;

export const tagGroupTranslationsRelations = relations(tagGroupTranslationsTable, ({ one }) => ({
  group: one(tagGroupsTable, {
    fields: [tagGroupTranslationsTable.groupId],
    references: [tagGroupsTable.id],
  }),
  language: one(languagesTable, {
    fields: [tagGroupTranslationsTable.locale],
    references: [languagesTable.code],
  }),
}));
