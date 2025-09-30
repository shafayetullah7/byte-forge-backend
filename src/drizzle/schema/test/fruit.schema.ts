import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  text,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm/sql';

// Define the fruits table
export const fruits = pgTable('fruits', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),

  name: varchar('name', { length: 100 }).notNull(),

  color: varchar('color', { length: 50 }).notNull(),

  sweetness: integer('sweetness'),

  description: text('description').notNull(),

  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Infer types for TypeScript
export type FruitType = typeof fruits.$inferSelect; // for querying
export type NewFruitType = typeof fruits.$inferInsert; // for inserting
