import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  decimal,
  json,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { ordersTable, paymentStatusEnum, paymentMethodEnum } from '../order/orders.schema';
import { PaymentStatusEnum } from '../../enum';

export const paymentTable = pgTable(
  'payments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orderId: uuid('order_id')
      .notNull()
      .unique()
      .references(() => ordersTable.id, { onDelete: 'cascade' }),
    amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).notNull().default('BDT'),
    method: paymentMethodEnum('method').notNull(),
    status: paymentStatusEnum('status')
      .default(PaymentStatusEnum.PENDING)
      .notNull(),
    transactionId: varchar('transaction_id', { length: 100 }),
    gatewayResponse: json('gateway_response'),
    paidAt: timestamp('paid_at', { mode: 'date', withTimezone: true }),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index('payments_order_id_idx').on(t.orderId),
    index('payments_status_idx').on(t.status),
    index('payments_method_idx').on(t.method),
    index('payments_transaction_id_idx').on(t.transactionId),
  ],
);

export type TPayment = typeof paymentTable.$inferSelect;
export type TNewPayment = typeof paymentTable.$inferInsert;

export const paymentRelations = relations(paymentTable, ({ one }) => ({
  order: one(ordersTable, {
    fields: [paymentTable.orderId],
    references: [ordersTable.id],
  }),
}));
