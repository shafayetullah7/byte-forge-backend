import { pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm/sql';
import { adminTable } from './admin.schema';
import { sessionTable } from '../session';

export const adminSessionTable = pgTable('admin_sessions', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  adminId: uuid('admin_id')
    .notNull()
    .references(() => adminTable.id),
  sessionId: uuid('session_id')
    .notNull()
    .references(() => sessionTable.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type TAdminSession = typeof adminSessionTable.$inferSelect;
export type TNewAdminSession = typeof adminSessionTable.$inferInsert;
