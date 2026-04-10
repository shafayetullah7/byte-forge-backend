import { pgTable, uuid, integer, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { categoriesTable } from './category.schema';

export const categoryHierarchyTable = pgTable(
  'category_hierarchy',
  {
    ancestorId: uuid('ancestor_id')
      .notNull()
      .references(() => categoriesTable.id, { onDelete: 'cascade' }),
    descendantId: uuid('descendant_id')
      .notNull()
      .references(() => categoriesTable.id, { onDelete: 'cascade' }),
    depth: integer('depth').notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.ancestorId, table.descendantId] }),
  ],
);

export type TCategoryHierarchy = typeof categoryHierarchyTable.$inferSelect;
export type TNewCategoryHierarchy = typeof categoryHierarchyTable.$inferInsert;

export const categoryHierarchyRelations = relations(
  categoryHierarchyTable,
  ({ one }) => ({
    ancestor: one(categoriesTable, {
      fields: [categoryHierarchyTable.ancestorId],
      references: [categoriesTable.id],
      relationName: 'ancestorToDescendant',
    }),
    descendant: one(categoriesTable, {
      fields: [categoryHierarchyTable.descendantId],
      references: [categoriesTable.id],
      relationName: 'descendantToAncestor',
    }),
  }),
);
