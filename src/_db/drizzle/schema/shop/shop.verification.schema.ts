import {
  pgTable,
  uuid,
  text,
  varchar,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { shopTable } from './shop.schema';

export const ShopVerificationStatusEnum = pgEnum(
  'shop_verification_status_enum',
  ['PENDING', 'REVIEWING', 'APPROVED', 'REJECTED'],
);

export const shopVerificationTable = pgTable('shop_verification', {
  id: uuid('id').defaultRandom().primaryKey(),

  shopId: uuid('shop_id')
    .notNull()
    .unique()
    .references(() => shopTable.id, { onDelete: 'cascade' }),

  // Shop-specific documents
  tradeLicenseNumber: varchar('trade_license_number', { length: 100 }),
  tradeLicenseDocument: text('trade_license_document'), // URL or path
  utilityBillDocument: text('utility_bill_document'), // optional supporting doc

  status: ShopVerificationStatusEnum('status').default('PENDING').notNull(),
  verifiedAt: timestamp('verified_at', { mode: 'date', withTimezone: true }),

  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Types
export type TShopVerification = typeof shopVerificationTable.$inferSelect;
export type TNewShopVerification = typeof shopVerificationTable.$inferInsert;
