import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  boolean,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const userTable = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  // .default(sql`gen_random_uuid()`),
  firstName: varchar('first_name', { length: 50 }).notNull(),
  lastName: varchar('last_name', { length: 50 }).notNull(),
  userName: varchar('user_name', { length: 50 }).unique().notNull(),
  avatar: text(),
  emailVerifiedAt: timestamp('email_verified_at', {
    mode: 'date',
    withTimezone: true,
  }),
  emailVerified: boolean('email_verified')
    .generatedAlwaysAs(sql`email_verified_at IS NOT NULL`)
    .notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type TUser = typeof userTable.$inferSelect;
export type TNewUser = typeof userTable.$inferInsert;
