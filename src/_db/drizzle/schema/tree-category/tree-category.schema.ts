import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';
import { mediaTable } from '../media';

export const treeCategoryTable = pgTable('tree_categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  description: text('description'),
  iconId: uuid('icon_id').references(() => mediaTable.id, {
    onDelete: 'set null',
  }),
  isHidden: boolean('is_hidden').default(false).notNull(),
  deletedAt: timestamp('deleted_at', { mode: 'date', withTimezone: true }),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type TTreeCategory = typeof treeCategoryTable.$inferSelect;
export type TNewTreeCategory = typeof treeCategoryTable.$inferInsert;
