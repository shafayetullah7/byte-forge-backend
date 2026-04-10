import {
  pgTable,
  uuid,
  timestamp,
  pgEnum,
  varchar,
  text,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { shopTable } from './shop.schema';
import { mediaTable } from '../media';
import { ShopVerificationStatusEnum } from '../../enum';

export const shopVerificationStatusEnum = pgEnum(
  'shop_verification_status_enum',
  [
    ShopVerificationStatusEnum.PENDING,
    ShopVerificationStatusEnum.REVIEWING,
    ShopVerificationStatusEnum.APPROVED,
    ShopVerificationStatusEnum.REJECTED,
  ],
);

export const shopVerificationTable = pgTable('shop_verification', {
  id: uuid('id').defaultRandom().primaryKey(),

  shopId: uuid('shop_id')
    .notNull()
    .unique()
    .references(() => shopTable.id, { onDelete: 'cascade' }),

  // Shop-specific documents
  tradeLicenseNumber: varchar('trade_license_number', { length: 100 }),
  tradeLicenseDocument: uuid('trade_license_document').references(
    () => mediaTable.id,
    { onDelete: 'no action' },
  ),
  tinNumber: varchar('tin_number', { length: 100 }),
  tinDocument: uuid('tin_document').references(() => mediaTable.id, {
    onDelete: 'no action',
  }),
  utilityBillDocument: uuid('utility_bill_document').references(
    () => mediaTable.id,
    { onDelete: 'no action' },
  ),

  status: shopVerificationStatusEnum('status')
    .default(ShopVerificationStatusEnum.PENDING)
    .notNull(),
  verifiedAt: timestamp('verified_at', { mode: 'date', withTimezone: true }),

  // Admin verification fields
  rejectionReason: text('rejection_reason'),
  adminNotes: text('admin_notes'),

  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const shopVerificationRelations = relations(
  shopVerificationTable,
  ({ one }) => ({
    shop: one(shopTable, {
      fields: [shopVerificationTable.shopId],
      references: [shopTable.id],
    }),
  }),
);

// Types
export type TShopVerification = typeof shopVerificationTable.$inferSelect;
export type TNewShopVerification = typeof shopVerificationTable.$inferInsert;
