import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { shopTable } from './shop.schema';
import { relations } from 'drizzle-orm';

export const shopContactTable = pgTable('shop_contact', {
  id: uuid('id').defaultRandom().primaryKey(),

  shopId: uuid('shop_id')
    .notNull()
    .unique() // one contact per shop
    .references(() => shopTable.id, { onDelete: 'cascade' }),

  // Contact Information
  businessEmail: varchar('business_email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  alternativePhone: varchar('alternative_phone', { length: 20 }),
  
  // Messaging Apps
  whatsapp: varchar('whatsapp', { length: 20 }),
  telegram: varchar('telegram', { length: 50 }),
  
  // Social Media
  facebook: varchar('facebook', { length: 255 }),
  instagram: varchar('instagram', { length: 255 }),
  x: varchar('x', { length: 255 }), // Twitter/X handle

  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Corrected types
export type TShopContact = typeof shopContactTable.$inferSelect;
export type TNewShopContact = typeof shopContactTable.$inferInsert;

export const shopContactRelations = relations(shopContactTable, ({ one }) => ({
  shop: one(shopTable, {
    fields: [shopContactTable.shopId],
    references: [shopTable.id],
  }),
}));
