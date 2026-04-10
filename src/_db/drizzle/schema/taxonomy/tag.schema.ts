import { pgTable, uuid, varchar, timestamp, boolean, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tagGroupsTable } from './tag-group.schema';
import { tagTranslationsTable } from './tag-translation.schema';

export const tagsTable = pgTable('tags', {
  id: uuid('id').defaultRandom().primaryKey(),
  groupId: uuid('group_id')
    .notNull()
    .references(() => tagGroupsTable.id, { onDelete: 'cascade' }),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  isActive: boolean('is_active').default(true).notNull(),
  usageCount: integer('usage_count').default(0).notNull(), // Track usage of the tag across products
  deletedAt: timestamp('deleted_at', { mode: 'date', withTimezone: true }),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type TTag = typeof tagsTable.$inferSelect;
export type TNewTag = typeof tagsTable.$inferInsert;

export const tagsRelations = relations(tagsTable, ({ one, many }) => ({
  group: one(tagGroupsTable, {
    fields: [tagsTable.groupId],
    references: [tagGroupsTable.id],
  }),
  translations: many(tagTranslationsTable),
}));
