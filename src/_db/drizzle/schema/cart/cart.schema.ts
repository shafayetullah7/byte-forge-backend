import {
  pgTable,
  uuid,
  integer,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { userTable } from '../user';
import { plantVariantTable } from '../plant';

export const cartItemTable = pgTable(
  'cart_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => userTable.id, {
      onDelete: 'cascade',
    }),
    sessionId: uuid('session_id'), // For guest carts
    plantVariantId: uuid('plant_variant_id')
      .notNull()
      .references(() => plantVariantTable.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull().default(1),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex('idx_cart_user_variant').on(table.userId, table.plantVariantId),
    uniqueIndex('idx_cart_session_variant').on(
      table.sessionId,
      table.plantVariantId,
    ),
  ],
);

export const cartItemRelations = relations(cartItemTable, ({ one }) => ({
  user: one(userTable, {
    fields: [cartItemTable.userId],
    references: [userTable.id],
  }),
  plantVariant: one(plantVariantTable, {
    fields: [cartItemTable.plantVariantId],
    references: [plantVariantTable.id],
  }),
}));

export type TCartItem = typeof cartItemTable.$inferSelect;
export type TNewCartItem = typeof cartItemTable.$inferInsert;
