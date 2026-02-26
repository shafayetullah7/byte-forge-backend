import { pgTable, uuid, timestamp, boolean, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tagsTable } from './tag.schema';
import { tagGroupTranslationsTable } from './tag-group-translation.schema';

export const tagGroupsTable = pgTable('tag_groups', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  isActive: boolean('is_active').default(true).notNull(),
  deletedAt: timestamp('deleted_at', { mode: 'date', withTimezone: true }),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type TTagGroup = typeof tagGroupsTable.$inferSelect;
export type TNewTagGroup = typeof tagGroupsTable.$inferInsert;

export const tagGroupsRelations = relations(tagGroupsTable, ({ many }) => ({
  tags: many(tagsTable),
  translations: many(tagGroupTranslationsTable),
}));
