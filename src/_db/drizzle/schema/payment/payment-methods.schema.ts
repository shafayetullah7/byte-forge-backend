import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { PaymentMethodEnum } from '../../enum';
import { mediaTable } from '../media';

export const paymentMethodTypeEnum = pgEnum('payment_method_type_enum', [
  PaymentMethodEnum.COD,
  PaymentMethodEnum.CARD,
  PaymentMethodEnum.BKASH,
  PaymentMethodEnum.NAGAD,
  PaymentMethodEnum.SSLCOMMERCE,
]);

export const paymentMethodStatusEnum = pgEnum('payment_method_status_enum', [
  'ACTIVE',
  'INACTIVE',
]);

/** Platform checkout catalog — one row per supported payment method key. */
export const paymentMethodsTable = pgTable('payment_methods', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: paymentMethodTypeEnum('key').notNull().unique(),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  logoId: uuid('logo_id').references(() => mediaTable.id, {
    onDelete: 'set null',
  }),
  description: text('description'),
  status: paymentMethodStatusEnum('status').default('INACTIVE').notNull(),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const paymentMethodsRelations = relations(
  paymentMethodsTable,
  ({ one }) => ({
    logo: one(mediaTable, {
      fields: [paymentMethodsTable.logoId],
      references: [mediaTable.id],
    }),
  }),
);

export type TPaymentMethodRow = typeof paymentMethodsTable.$inferSelect;
export type TNewPaymentMethodRow = typeof paymentMethodsTable.$inferInsert;

export type PaymentMethodWithLogo = TPaymentMethodRow & {
  logoUrl: string | null;
};
