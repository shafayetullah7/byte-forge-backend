import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  varchar,
  boolean,
} from 'drizzle-orm/pg-core';
import { shopBranchManagerTable } from './shop.branch.manager.schema';

export const IdTypeEnum = pgEnum('id_type_enum', [
  'nid',
  'passport',
  'driving_license',
  'other',
]);

export const shopBranchManagerVerificationInfoTable = pgTable(
  'shop_branch_manager_verification_info',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    shopBranchManagerId: uuid('shop_branch_manager_id')
      .notNull()
      .references(() => shopBranchManagerTable.id, { onDelete: 'cascade' }),
    address: text('address').notNull(),
    idType: IdTypeEnum('id_type').notNull(),
    idNumber: varchar('id_number', { length: 100 }).notNull(),
    idDocument: text('id_document').notNull(), // could store file path or URL
    proofOfAddress: text('proof_of_address').notNull(), // file path or URL
    backgroundCheckAuthorization: boolean('background_check_authorization')
      .default(false)
      .notNull(),
    professionalCertification: text('professional_certification'),
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

export type TShopBranchManagerVerificationInfo =
  typeof shopBranchManagerVerificationInfoTable.$inferSelect;
export type TNewShopBranchManagerVerificationInfo =
  typeof shopBranchManagerVerificationInfoTable.$inferInsert;
