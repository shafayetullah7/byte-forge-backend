import { pgTable, uuid, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { businessAccountTable } from './business.account.schema';

export const BusinessVerificationStatusEnum = pgEnum(
  'business_verification_status_enum',
  ['PENDING', 'REVIEWING', 'APPROVED', 'REJECTED'],
);

export const businessAccountVerificationTable = pgTable(
  'business_account_verification',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    businessAccountId: uuid('business_account_id')
      .notNull()
      .references(() => businessAccountTable.id, { onDelete: 'cascade' }),

    // Business-specific documents
    tradeLicenseNumber: varchar('trade_license_number', { length: 100 }),
    tradeLicenseDocument: varchar('trade_license_document', { length: 255 }), // URL/path
    tinNumber: varchar('tin_number', { length: 100 }),
    tinDocument: varchar('tin_document', { length: 255 }), // URL/path
    otherSupportingDocument: varchar('other_supporting_document', {
      length: 255,
    }), // optional

    status: BusinessVerificationStatusEnum('status')
      .default('PENDING')
      .notNull(),
    verifiedAt: timestamp('verified_at', { mode: 'date', withTimezone: true }),

    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
);

// Types
export type TBusinessAccountVerification =
  typeof businessAccountVerificationTable.$inferSelect;
export type TNewBusinessAccountVerification =
  typeof businessAccountVerificationTable.$inferInsert;
