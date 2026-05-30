import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  json,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { userTable } from '../user/user.schema';
import { PaymentMethodEnum } from '../../enum';

export const paymentMethodTypeEnum = pgEnum('payment_method_type_enum', [
  PaymentMethodEnum.COD,
  PaymentMethodEnum.CARD,
  PaymentMethodEnum.BKASH,
  PaymentMethodEnum.NAGAD,
  PaymentMethodEnum.SSLCOMMERCE,
]);

export const paymentMethodsTable = pgTable(
  'payment_methods',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
    type: paymentMethodTypeEnum('type').notNull(),
    lastFour: varchar('last_four', { length: 4 }),
    expiry: varchar('expiry', { length: 7 }),
    isDefault: boolean('is_default').default(false).notNull(),
    metadata: json('metadata'),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index('payment_methods_user_id_idx').on(t.userId),
    index('payment_methods_is_default_idx').on(t.userId, t.isDefault),
  ],
);

export type TPaymentMethod = typeof paymentMethodsTable.$inferSelect;
export type TNewPaymentMethod = typeof paymentMethodsTable.$inferInsert;

export const paymentMethodsRelations = relations(
  paymentMethodsTable,
  ({ one }) => ({
    user: one(userTable, {
      fields: [paymentMethodsTable.userId],
      references: [userTable.id],
    }),
  }),
);
