import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';
import { userTable } from '../user';
import { mediaTable } from '../media';

export const managerTable = pgTable('manager', {
  id: uuid('id').defaultRandom().primaryKey(),

  userId: uuid('user_id') // previously managerId
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade' }),

  name: varchar('name', { length: 255 }).notNull(),
  workingSince: timestamp('working_since', {
    mode: 'date',
    withTimezone: true,
  }),

  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  alternativePhone: varchar('alternative_phone', { length: 20 }),
  whatsapp: varchar('whatsapp', { length: 20 }),
  telegram: varchar('telegram', { length: 20 }),
  managerImage: uuid('manager_image').references(() => mediaTable.id, {
    onDelete: 'no action',
  }),

  verified: boolean('verified').default(false).notNull(),

  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Corrected types
export type TManager = typeof managerTable.$inferSelect;
export type TNewManager = typeof managerTable.$inferInsert;
