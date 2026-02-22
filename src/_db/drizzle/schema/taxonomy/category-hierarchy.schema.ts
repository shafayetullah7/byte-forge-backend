import { pgTable, uuid, integer, primaryKey } from 'drizzle-orm/pg-core';
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
  (table) => ({
    pk: primaryKey({ columns: [table.ancestorId, table.descendantId] }),
  }),
);

export type TCategoryHierarchy = typeof categoryHierarchyTable.$inferSelect;
export type TNewCategoryHierarchy = typeof categoryHierarchyTable.$inferInsert;
