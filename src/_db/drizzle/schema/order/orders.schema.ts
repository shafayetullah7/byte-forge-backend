import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  decimal,
  text,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { userTable } from '../user/user.schema';
import { shopTable } from '../shop/shop.schema';
import { OrderStatusEnum, PaymentStatusEnum } from '../../enum';
import { PaymentMethodEnum } from '../../enum/payment-method.enum';
import { orderItemsTable } from './order-items.schema';
import { orderStatusHistoryTable } from './order-status-history.schema';
import { orderAddressTable } from './order-address.schema';
import { orderGroupsTable } from './order-groups.schema';

export const orderStatusEnum = pgEnum('order_status_enum', [
  OrderStatusEnum.PENDING_PAYMENT,
  OrderStatusEnum.CONFIRMED,
  OrderStatusEnum.PROCESSING,
  OrderStatusEnum.SHIPPED,
  OrderStatusEnum.DELIVERED,
  OrderStatusEnum.CANCELLED,
  OrderStatusEnum.EXPIRED,
]);

export const paymentStatusEnum = pgEnum('payment_status_enum', [
  PaymentStatusEnum.PENDING,
  PaymentStatusEnum.PROCESSING,
  PaymentStatusEnum.COMPLETED,
  PaymentStatusEnum.FAILED,
  PaymentStatusEnum.REFUNDED,
  PaymentStatusEnum.PARTIALLY_REFUNDED,
]);

export const paymentMethodEnum = pgEnum('payment_method_enum', [
  PaymentMethodEnum.COD,
  PaymentMethodEnum.CARD,
  PaymentMethodEnum.BKASH,
  PaymentMethodEnum.NAGAD,
  PaymentMethodEnum.SSLCOMMERCE,
]);

export const ordersTable = pgTable(
  'orders',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orderNumber: varchar('order_number', { length: 50 })
      .notNull()
      .unique(),
    userId: uuid('user_id')
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
    shopId: uuid('shop_id')
      .notNull()
      .references(() => shopTable.id, { onDelete: 'cascade' }),
    groupId: uuid('group_id').references(() => orderGroupsTable.id, {
      onDelete: 'set null',
    }),
    status: orderStatusEnum('status')
      .default(OrderStatusEnum.PENDING_PAYMENT)
      .notNull(),
    subtotal: decimal('subtotal', { precision: 12, scale: 2 }).notNull(),
    shippingCost: decimal('shipping_cost', { precision: 12, scale: 2 })
      .notNull()
      .default('0'),
    tax: decimal('tax', { precision: 12, scale: 2 }).notNull().default('0'),
    total: decimal('total', { precision: 12, scale: 2 }).notNull(),
    paymentStatus: paymentStatusEnum('payment_status')
      .default(PaymentStatusEnum.PENDING)
      .notNull(),
    paymentMethod: paymentMethodEnum('payment_method'),
    notes: text('notes'),
    cancelledAt: timestamp('cancelled_at', {
      mode: 'date',
      withTimezone: true,
    }),
    cancelledReason: text('cancelled_reason'),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index('orders_user_id_idx').on(t.userId),
    index('orders_shop_id_idx').on(t.shopId),
    index('orders_status_idx').on(t.status),
    index('orders_payment_status_idx').on(t.paymentStatus),
    index('orders_order_number_idx').on(t.orderNumber),
    index('orders_created_at_idx').on(t.createdAt),
    index('orders_group_id_idx').on(t.groupId),
  ],
);

export type TOrder = typeof ordersTable.$inferSelect;
export type TNewOrder = typeof ordersTable.$inferInsert;

export const ordersRelations = relations(ordersTable, ({ one, many }) => ({
  user: one(userTable, {
    fields: [ordersTable.userId],
    references: [userTable.id],
  }),
  shop: one(shopTable, {
    fields: [ordersTable.shopId],
    references: [shopTable.id],
  }),
  group: one(orderGroupsTable, {
    fields: [ordersTable.groupId],
    references: [orderGroupsTable.id],
  }),
  items: many(orderItemsTable),
  statusHistory: many(orderStatusHistoryTable),
  address: one(orderAddressTable, {
    fields: [ordersTable.id],
    references: [orderAddressTable.orderId],
  }),
}));
