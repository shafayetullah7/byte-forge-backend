import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  integer,
  boolean,
  index,
  pgEnum,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import { userTable } from '../user/user.schema';
import { productsTable } from '../products/products.schema';
import { orderItemsTable } from '../order/order-items.schema';
import { ReviewStatusEnum } from '../../enum';
import { reviewImagesTable } from './review-images.schema';
import { adminTable } from '../admin/admin.schema';
import { reviewReportsTable } from './review-reports.schema';

export const reviewStatusEnum = pgEnum('review_status_enum', [
  ReviewStatusEnum.PENDING,
  ReviewStatusEnum.APPROVED,
  ReviewStatusEnum.REJECTED,
]);

export const reviewsTable = pgTable(
  'reviews',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
    orderItemId: uuid('order_item_id')
      .notNull()
      .unique()
      .references(() => orderItemsTable.id, { onDelete: 'cascade' }),
    productId: uuid('product_id')
      .notNull()
      .references(() => productsTable.id, { onDelete: 'cascade' }),
    rating: integer('rating').notNull(),
    title: varchar('title', { length: 255 }),
    comment: text('comment'),
    isVerifiedPurchase: boolean('is_verified_purchase').default(true).notNull(),
    status: reviewStatusEnum('status')
      .default(ReviewStatusEnum.APPROVED)
      .notNull(),
    isFeatured: boolean('is_featured').default(false).notNull(),
    featuredAt: timestamp('featured_at', { mode: 'date', withTimezone: true }),
    featuredByAdminId: uuid('featured_by_admin_id').references(
      () => adminTable.id,
      { onDelete: 'set null' },
    ),
    isRemovedByAdmin: boolean('is_removed_by_admin').default(false).notNull(),
    removedByAdminAt: timestamp('removed_by_admin_at', {
      mode: 'date',
      withTimezone: true,
    }),
    removedByAdminId: uuid('removed_by_admin_id').references(
      () => adminTable.id,
      { onDelete: 'set null' },
    ),
    removedReason: text('removed_reason'),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    check('reviews_rating_check', sql`${t.rating} >= 1 AND ${t.rating} <= 5`),
    index('reviews_user_id_idx').on(t.userId),
    index('reviews_product_id_idx').on(t.productId),
    index('reviews_order_item_id_idx').on(t.orderItemId),
    index('reviews_status_idx').on(t.status),
    index('reviews_rating_idx').on(t.rating),
    index('reviews_is_featured_idx').on(t.isFeatured),
    index('reviews_is_removed_by_admin_idx').on(t.isRemovedByAdmin),
  ],
);

export type TReview = typeof reviewsTable.$inferSelect;
export type TNewReview = typeof reviewsTable.$inferInsert;

export const reviewsRelations = relations(reviewsTable, ({ one, many }) => ({
  user: one(userTable, {
    fields: [reviewsTable.userId],
    references: [userTable.id],
  }),
  product: one(productsTable, {
    fields: [reviewsTable.productId],
    references: [productsTable.id],
  }),
  orderItem: one(orderItemsTable, {
    fields: [reviewsTable.orderItemId],
    references: [orderItemsTable.id],
  }),
  images: many(reviewImagesTable),
  reports: many(reviewReportsTable),
  featuredByAdmin: one(adminTable, {
    fields: [reviewsTable.featuredByAdminId],
    references: [adminTable.id],
  }),
  removedByAdmin: one(adminTable, {
    fields: [reviewsTable.removedByAdminId],
    references: [adminTable.id],
  }),
}));
