import { sql } from 'drizzle-orm/sql';
import { pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { sessionTable } from '../session';
import { adminLocalAuthTable } from './admin.local.auth.schema';

export const adminLocalAuthSessionTable = pgTable('admin_local_auth_session', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  sessionId: uuid('session_id')
    .notNull()
    .references(() => sessionTable.id),
  localAuthId: uuid('local_auth_id')
    .notNull()
    .references(() => adminLocalAuthTable.adminId),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type TAdminLocalAuthSession =
  typeof adminLocalAuthSessionTable.$inferSelect;
export type TNewAdminLocalAuthSession =
  typeof adminLocalAuthSessionTable.$inferInsert;
