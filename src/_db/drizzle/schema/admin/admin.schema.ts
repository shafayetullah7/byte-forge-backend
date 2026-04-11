import { sql } from 'drizzle-orm';
import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';

export const adminTable = pgTable('admins', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: varchar('first_name', { length: 50 }).notNull(),
  lastName: varchar('last_name', { length: 50 }).notNull(),
  userName: varchar('user_name', { length: 50 }).unique().notNull(),
  avatar: text(),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type TAdmin = typeof adminTable.$inferSelect;
export type TNewAdmin = typeof adminTable.$inferInsert;
