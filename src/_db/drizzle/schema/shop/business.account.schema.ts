import { pgTable, uuid, varchar, pgEnum, timestamp } from 'drizzle-orm/pg-core';
import { mediaTable } from '../media';
import { userTable } from '../user';

export const BusinessAccountVerificationStatusEnum = pgEnum(
  'business_account_verification_status_enum',
  ['UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED'],
);

export const businessAccountTable = pgTable('business_account', {
  id: uuid('id').defaultRandom().primaryKey(),

  ownerId: uuid('owner_id')
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade' }),

  name: varchar('name', { length: 255 }).notNull(),

  address: varchar('address', { length: 500 }).notNull(), // optional: change if needed

  verificationStatus: BusinessAccountVerificationStatusEnum(
    'verification_status',
  ).notNull(),

  logo: uuid('logo_id').references(() => mediaTable.id, {
    onDelete: 'cascade',
  }),

  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
