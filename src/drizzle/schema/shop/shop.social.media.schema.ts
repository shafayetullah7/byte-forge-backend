import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { shopTable } from './shop.schema';

export const shopSocialMediaTable = pgTable('shop_social_media', {
  id: uuid('id').defaultRandom().primaryKey(),
  shopId: uuid('shop_id')
    .notNull()
    .unique()
    .references(() => shopTable.id, { onDelete: 'cascade' }),
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

export type TShopSocialMedia = typeof shopSocialMediaTable.$inferSelect;
export type TNewShopSocialMedia = typeof shopSocialMediaTable.$inferInsert;
