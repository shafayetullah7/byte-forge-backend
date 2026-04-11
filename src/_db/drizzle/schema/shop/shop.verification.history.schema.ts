import {
  pgTable,
  uuid,
  timestamp,
  varchar,
  text,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { shopTable } from './shop.schema';

export const shopVerificationHistoryTable = pgTable(
  'shop_verification_history',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    shopId: uuid('shop_id')
      .notNull()
      .references(() => shopTable.id, { onDelete: 'cascade' }),
    action: varchar('action', { length: 50 }).notNull(),
    // 'submitted', 'approved', 'rejected', 'suspended', 'activated', 'deactivated'
    previousStatus: varchar('previous_status', { length: 50 }),
    newStatus: varchar('new_status', { length: 50 }).notNull(),
    reason: text('reason'),
    changes: jsonb('changes'),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_shop_verification_history').on(
      table.shopId,
      table.createdAt.desc(),
    ),
  ],
);

export const shopVerificationHistoryRelations = relations(
  shopVerificationHistoryTable,
  ({ one }) => ({
    shop: one(shopTable, {
      fields: [shopVerificationHistoryTable.shopId],
      references: [shopTable.id],
    }),
  }),
);

export type TShopVerificationHistory =
  typeof shopVerificationHistoryTable.$inferSelect;
export type TNewShopVerificationHistory =
  typeof shopVerificationHistoryTable.$inferInsert;
