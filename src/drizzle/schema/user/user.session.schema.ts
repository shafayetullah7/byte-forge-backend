import { pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { userTable } from './user.schema';
import { sql } from 'drizzle-orm/sql';
import { Session } from '../session';

export const userSessionTable = pgTable('user_sessions', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => userTable.id),
  sessionId: uuid('session_id')
    .notNull()
    .references(() => Session.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type TUserSession = typeof userSessionTable.$inferSelect;
export type TNewUserSession = typeof userSessionTable.$inferInsert;
