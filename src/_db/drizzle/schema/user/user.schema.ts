import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  boolean,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import { userLocalAuthTable } from './user.local.auth.schema';
import { shopFollowsTable } from '../shop/shop.follow.schema';
import { wishlistsTable } from '../cart/wishlists.schema';

export const userTable = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
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

export const userRelations = relations(userTable, ({ one, many }) => ({
  localAuth: one(userLocalAuthTable, {
    fields: [userTable.id],
    references: [userLocalAuthTable.userId],
  }),
  shopFollows: many(shopFollowsTable),
  wishlists: many(wishlistsTable),
}));
