import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { ordersTable } from '../order/orders.schema';
import { ShippingStatusEnum } from '../../enum';
import { shipmentStatusHistoryTable } from './shipment-status-history.schema';

export const shippingStatusEnum = pgEnum('shipping_status_enum', [
  ShippingStatusEnum.PENDING,
  ShippingStatusEnum.PICKED_UP,
  ShippingStatusEnum.IN_TRANSIT,
  ShippingStatusEnum.OUT_FOR_DELIVERY,
  ShippingStatusEnum.DELIVERED,
  ShippingStatusEnum.RETURNED,
  ShippingStatusEnum.FAILED,
]);

export const shipmentsTable = pgTable(
  'shipments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orderId: uuid('order_id')
      .notNull()
      .unique()
      .references(() => ordersTable.id, { onDelete: 'cascade' }),
    trackingNumber: varchar('tracking_number', { length: 100 }).unique(),
    carrier: varchar('carrier', { length: 100 }),
    status: shippingStatusEnum('status')
      .default(ShippingStatusEnum.PENDING)
      .notNull(),
    estimatedDelivery: timestamp('estimated_delivery', {
      mode: 'date',
      withTimezone: true,
    }),
    shippedAt: timestamp('shipped_at', { mode: 'date', withTimezone: true }),
    deliveredAt: timestamp('delivered_at', {
      mode: 'date',
      withTimezone: true,
    }),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index('shipments_order_id_idx').on(t.orderId),
    index('shipments_tracking_number_idx').on(t.trackingNumber),
    index('shipments_status_idx').on(t.status),
  ],
);

export type TShipment = typeof shipmentsTable.$inferSelect;
export type TNewShipment = typeof shipmentsTable.$inferInsert;

export const shipmentsRelations = relations(shipmentsTable, ({ one, many }) => ({
  order: one(ordersTable, {
    fields: [shipmentsTable.orderId],
    references: [ordersTable.id],
  }),
  statusHistory: many(shipmentStatusHistoryTable),
}));
