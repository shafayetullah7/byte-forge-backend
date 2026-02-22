import { pgTable, uuid, varchar, text, timestamp, boolean, decimal, integer } from 'drizzle-orm/pg-core';

export const categoriesTable = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  isActive: boolean('is_active').default(false).notNull(),
  commissionRate: decimal('commission_rate', { precision: 5, scale: 2 }), // e.g. 15.00
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
