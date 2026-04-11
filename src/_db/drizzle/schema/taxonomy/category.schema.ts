import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  decimal,
  integer,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { categoryHierarchyTable } from './category-hierarchy.schema';
import { categoryTranslationsTable } from './category-translation.schema';

export const categoriesTable = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  isActive: boolean('is_active').default(false).notNull(),
  commissionRate: decimal('commission_rate', { precision: 5, scale: 2 }), // e.g. 15.00
  childrenCount: integer('children_count').default(0).notNull(), // Count of immediate children
  usageCount: integer('usage_count').default(0).notNull(), // Count of products
  deletedAt: timestamp('deleted_at', { mode: 'date', withTimezone: true }),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type TCategory = typeof categoriesTable.$inferSelect;
export type TNewCategory = typeof categoriesTable.$inferInsert;

export const categoriesRelations = relations(categoriesTable, ({ many }) => ({
  parentHierarchies: many(categoryHierarchyTable, {
    relationName: 'descendantToAncestor',
  }),
  childHierarchies: many(categoryHierarchyTable, {
    relationName: 'ancestorToDescendant',
  }),
  translations: many(categoryTranslationsTable),
}));
