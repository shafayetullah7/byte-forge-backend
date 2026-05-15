import {
  pgTable,
  uuid,
  integer,
  varchar,
  text,
  timestamp,
  pgEnum,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { inventoryTable } from './inventory.schema';
import { shopTable } from '../shop/shop.schema';
import { userTable } from '../user/user.schema';
import { InventoryMovementTypeEnum } from '../../enum/inventory-movement-type.enum';

export const inventoryMovementTypeEnum = pgEnum(
  'inventory_movement_type_enum',
  [
    InventoryMovementTypeEnum.INITIAL_STOCK,
    InventoryMovementTypeEnum.RESTOCK,
    InventoryMovementTypeEnum.ORDER_RESERVED,
    InventoryMovementTypeEnum.ORDER_FULFILLED,
    InventoryMovementTypeEnum.ORDER_CANCELLED,
    InventoryMovementTypeEnum.CUSTOMER_RETURN,
    InventoryMovementTypeEnum.DAMAGED,
    InventoryMovementTypeEnum.LOST,
    InventoryMovementTypeEnum.ADJUSTMENT,
    InventoryMovementTypeEnum.TRANSFER_OUT,
    InventoryMovementTypeEnum.TRANSFER_IN,
  ],
);

/**
 * Inventory Movements Table
 *
 * Immutable audit trail for every stock change.
 * Every modification to inventory.quantity or inventory.reserved_quantity
 * MUST create a corresponding movement record.
 *
 * Movement records cannot be updated or deleted.
 * Corrections are new movement records.
 */
export const inventoryMovementsTable = pgTable(
  'inventory_movements',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    inventoryId: uuid('inventory_id')
      .notNull()
      .references(() => inventoryTable.id, { onDelete: 'cascade' }),
    shopId: uuid('shop_id')
      .notNull()
      .references(() => shopTable.id, { onDelete: 'cascade' }),
    movementType: inventoryMovementTypeEnum('movement_type').notNull(),
    quantityChange: integer('quantity_change').notNull(),
    previousQuantity: integer('previous_quantity').notNull(),
    newQuantity: integer('new_quantity').notNull(),
    previousReserved: integer('previous_reserved').notNull(),
    newReserved: integer('new_reserved').notNull(),
    referenceType: varchar('reference_type', { length: 50 }),
    referenceId: uuid('reference_id'),
    reason: text('reason'),
    createdBy: uuid('created_by').references(() => userTable.id, {
      onDelete: 'set null',
    }),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index('inventory_movements_inventory_id_idx').on(t.inventoryId),
    index('inventory_movements_shop_id_idx').on(t.shopId),
    index('inventory_movements_inventory_created_at_idx').on(
      t.inventoryId,
      t.createdAt,
    ),
    index('inventory_movements_shop_created_at_idx').on(
      t.shopId,
      t.createdAt,
    ),
    index('inventory_movements_reference_idx').on(
      t.referenceType,
      t.referenceId,
    ),
    index('inventory_movements_movement_type_idx').on(t.movementType),
  ],
);

export type TInventoryMovement = typeof inventoryMovementsTable.$inferSelect;
export type TNewInventoryMovement = typeof inventoryMovementsTable.$inferInsert;

export const inventoryMovementsRelations = relations(
  inventoryMovementsTable,
  ({ one }) => ({
    inventory: one(inventoryTable, {
      fields: [inventoryMovementsTable.inventoryId],
      references: [inventoryTable.id],
    }),
    shop: one(shopTable, {
      fields: [inventoryMovementsTable.shopId],
      references: [shopTable.id],
    }),
    user: one(userTable, {
      fields: [inventoryMovementsTable.createdBy],
      references: [userTable.id],
    }),
  }),
);
