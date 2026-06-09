import { pgTable, uuid, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { reviewsTable } from './reviews.schema';
import { mediaTable } from '../media/media.schema';

export const reviewImagesTable = pgTable(
  'review_images',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    reviewId: uuid('review_id')
      .notNull()
      .references(() => reviewsTable.id, { onDelete: 'cascade' }),
    mediaId: uuid('media_id')
      .notNull()
      .references(() => mediaTable.id, { onDelete: 'cascade' }),
    displayOrder: integer('display_order').notNull().default(0),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index('review_images_review_id_idx').on(t.reviewId),
    index('review_images_media_id_idx').on(t.mediaId),
  ],
);

export type TReviewImage = typeof reviewImagesTable.$inferSelect;
export type TNewReviewImage = typeof reviewImagesTable.$inferInsert;

export const reviewImagesRelations = relations(
  reviewImagesTable,
  ({ one }) => ({
    review: one(reviewsTable, {
      fields: [reviewImagesTable.reviewId],
      references: [reviewsTable.id],
    }),
    media: one(mediaTable, {
      fields: [reviewImagesTable.mediaId],
      references: [mediaTable.id],
    }),
  }),
);
