import { pgTable, uuid, decimal, timestamp, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { shopTable } from './shop.schema';
import { districtsTable } from '../location/district.schema';

export const shopShippingRatesTable = pgTable(
  'shop_shipping_rates',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    shopId: uuid('shop_id')
      .notNull()
      .references(() => shopTable.id, { onDelete: 'cascade' }),
    districtId: uuid('district_id')
      .notNull()
      .references(() => districtsTable.id, { onDelete: 'cascade' }),
    cost: decimal('cost', { precision: 10, scale: 2 }).notNull(),
    costPerKg: decimal('cost_per_kg', { precision: 10, scale: 2 })
      .notNull()
      .default('0'),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [unique().on(table.shopId, table.districtId)],
);

export type TShopShippingRate = typeof shopShippingRatesTable.$inferSelect;
export type TNewShopShippingRate = typeof shopShippingRatesTable.$inferInsert;

export const shopShippingRatesRelations = relations(
  shopShippingRatesTable,
  ({ one }) => ({
    shop: one(shopTable, {
      fields: [shopShippingRatesTable.shopId],
      references: [shopTable.id],
    }),
    district: one(districtsTable, {
      fields: [shopShippingRatesTable.districtId],
      references: [districtsTable.id],
    }),
  }),
);
