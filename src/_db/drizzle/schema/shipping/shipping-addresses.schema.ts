import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  text,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { userTable } from '../user/user.schema';
import { districtsTable } from '../location/district.schema';
import { divisionsTable } from '../location/division.schema';
import { AddressTypeEnum } from '../../enum';

export const addressTypeEnum = pgEnum('address_type_enum', [
  AddressTypeEnum.SHIPPING,
  AddressTypeEnum.BILLING,
  AddressTypeEnum.BOTH,
]);

export const userAddressesTable = pgTable(
  'user_addresses',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
    type: addressTypeEnum('type')
      .notNull()
      .default(AddressTypeEnum.SHIPPING),
    label: varchar('label', { length: 50 }).notNull(),
    recipientName: varchar('recipient_name', { length: 100 }).notNull(),
    phone: varchar('phone', { length: 20 }).notNull(),
    addressLine1: varchar('address_line1', { length: 255 }).notNull(),
    addressLine2: varchar('address_line2', { length: 255 }),
    districtId: uuid('district_id')
      .notNull()
      .references(() => districtsTable.id, { onDelete: 'restrict' }),
    divisionId: uuid('division_id')
      .notNull()
      .references(() => divisionsTable.id, { onDelete: 'restrict' }),
    postalCode: varchar('postal_code', { length: 20 }),
    country: varchar('country', { length: 100 }).notNull().default('Bangladesh'),
    companyName: varchar('company_name', { length: 255 }),
    deliveryInstructions: text('delivery_instructions'),
    billingNotes: text('billing_notes'),
    isDefault: boolean('is_default').default(false).notNull(),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index('user_addresses_user_id_idx').on(t.userId),
    index('user_addresses_type_idx').on(t.userId, t.type),
    index('user_addresses_is_default_idx').on(t.userId, t.isDefault),
    index('user_addresses_district_id_idx').on(t.districtId),
    index('user_addresses_division_id_idx').on(t.divisionId),
  ],
);

export type TUserAddress = typeof userAddressesTable.$inferSelect;
export type TNewUserAddress = typeof userAddressesTable.$inferInsert;

export const userAddressesRelations = relations(
  userAddressesTable,
  ({ one }) => ({
    user: one(userTable, {
      fields: [userAddressesTable.userId],
      references: [userTable.id],
    }),
    district: one(districtsTable, {
      fields: [userAddressesTable.districtId],
      references: [districtsTable.id],
    }),
    division: one(divisionsTable, {
      fields: [userAddressesTable.divisionId],
      references: [divisionsTable.id],
    }),
  }),
);
