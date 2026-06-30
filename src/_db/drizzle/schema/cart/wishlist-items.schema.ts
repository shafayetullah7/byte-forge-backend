import { pgTable, uuid, timestamp, index, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { wishlistsTable } from './wishlists.schema';
import { productVariantsTable } from '../products/product-variants.schema';

export const wishlistItemsTable = pgTable(
  'wishlist_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    wishlistId: uuid('wishlist_id')
      .notNull()
      .references(() => wishlistsTable.id, { onDelete: 'cascade' }),
    variantId: uuid('variant_id')
      .notNull()
      .references(() => productVariantsTable.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    unique().on(t.wishlistId, t.variantId),
    index('wishlist_items_wishlist_id_idx').on(t.wishlistId),
    index('wishlist_items_variant_id_idx').on(t.variantId),
  ],
);

export type TWishlistItem = typeof wishlistItemsTable.$inferSelect;
export type TNewWishlistItem = typeof wishlistItemsTable.$inferInsert;

export const wishlistItemsRelations = relations(
  wishlistItemsTable,
  ({ one }) => ({
    wishlist: one(wishlistsTable, {
      fields: [wishlistItemsTable.wishlistId],
      references: [wishlistsTable.id],
    }),
    variant: one(productVariantsTable, {
      fields: [wishlistItemsTable.variantId],
      references: [productVariantsTable.id],
    }),
  }),
);
