import { sql } from 'drizzle-orm/sql';
import { pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { userLocalAuthTable } from './user.local.auth.schema';
import { Session } from '../session';

export const userLocalAuthSessionTable = pgTable('user_local_auth_session', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  sessionId: uuid('session_id')
    .notNull()
    .references(() => Session.id),
  localAuthId: uuid('local_auth_id')
    .notNull()
    .references(() => userLocalAuthTable.userId),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type TUserLocalAuthSession =
  typeof userLocalAuthSessionTable.$inferSelect;
export type TNewUserLocalAuthSession =
  typeof userLocalAuthSessionTable.$inferInsert;
