import { pgTable, uuid, varchar, pgEnum, timestamp } from 'drizzle-orm/pg-core';
import { mediaTable } from '../media';
import { userTable } from '../user';
import { BusinessAccountVerificationStatusEnum } from '../../enum';

export const businessAccountVerificationStatus = pgEnum(
  'business_account_verification_status_enum',
  BusinessAccountVerificationStatusEnum, // use same values
);

export const businessAccountTable = pgTable('business_account', {
  id: uuid('id').defaultRandom().primaryKey(),

  ownerId: uuid('owner_id')
    .notNull()
    .unique()
    .references(() => userTable.id, { onDelete: 'cascade' }),

  name: varchar('name', { length: 255 }).notNull(),

  address: varchar('address', { length: 500 }).notNull(), // optional: change if needed

  verificationStatus: businessAccountVerificationStatus('verification_status')
    .default(BusinessAccountVerificationStatusEnum.UNVERIFIED)
    .notNull(),

  logo: uuid('logo_id').references(() => mediaTable.id, {
    onDelete: 'no action',
  }),

  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type TBusinessAccount = typeof businessAccountTable.$inferSelect;
export type TNewBusinessAccount = typeof businessAccountTable.$inferInsert;
