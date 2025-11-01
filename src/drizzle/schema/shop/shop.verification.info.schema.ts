import { pgTable, uuid, text, varchar, timestamp } from 'drizzle-orm/pg-core';
import { shopTable } from './shop.schema';

export const shopVerificationInfoTable = pgTable('shop_verification_info', {
  id: uuid('id').defaultRandom().primaryKey(),

  shopId: uuid('shop_id')
    .notNull()
    .references(() => shopTable.id, { onDelete: 'cascade' }),

  businessLicenseNumber: varchar('business_license_number', {
    length: 100,
  }),
  businessLicense: text('business_license'), // file path or URL
  tinNumber: varchar('tin_number', { length: 100 }).notNull(),
  tin: text('tin').notNull(), // file path or URL
  businessDocument: text('business_document').notNull(), // supporting doc path or URL
  ownerIdProof: text('owner_id_proof').notNull(), // owner ID document path or URL
  professionalCertification: text('professional_certification'), // optional file path or URL

  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Types
export type TShopVerificationInfo =
  typeof shopVerificationInfoTable.$inferSelect;
export type TNewShopVerificationInfo =
  typeof shopVerificationInfoTable.$inferInsert;
