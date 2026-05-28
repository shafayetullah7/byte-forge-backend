import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { shipmentsTable } from './shipments.schema';

export const shipmentStatusHistoryTable = pgTable(
  'shipment_status_history',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    shipmentId: uuid('shipment_id')
      .notNull()
      .references(() => shipmentsTable.id, { onDelete: 'cascade' }),
    status: varchar('status', { length: 50 }).notNull(),
    location: varchar('location', { length: 100 }),
    notes: text('notes'),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index('shipment_status_history_shipment_id_idx').on(t.shipmentId),
    index('shipment_status_history_created_at_idx').on(
      t.shipmentId,
      t.createdAt,
    ),
  ],
);

export type TShipmentStatusHistory = typeof shipmentStatusHistoryTable.$inferSelect;
export type TNewShipmentStatusHistory = typeof shipmentStatusHistoryTable.$inferInsert;

export const shipmentStatusHistoryRelations = relations(
  shipmentStatusHistoryTable,
  ({ one }) => ({
    shipment: one(shipmentsTable, {
      fields: [shipmentStatusHistoryTable.shipmentId],
      references: [shipmentsTable.id],
    }),
  }),
);
