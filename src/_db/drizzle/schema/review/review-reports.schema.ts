import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { reviewsTable } from './reviews.schema';
import { userTable } from '../user/user.schema';
import { adminTable } from '../admin/admin.schema';

export const reviewReportStatusEnum = pgEnum('review_report_status_enum', [
  'OPEN',
  'RESOLVED',
  'DISMISSED',
]);

export const reviewReportsTable = pgTable(
  'review_reports',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    reviewId: uuid('review_id')
      .notNull()
      .references(() => reviewsTable.id, { onDelete: 'cascade' }),
    reportedBySellerUserId: uuid('reported_by_seller_user_id')
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
    reason: varchar('reason', { length: 255 }).notNull(),
    details: text('details'),
    status: reviewReportStatusEnum('status').default('OPEN').notNull(),
    resolvedAt: timestamp('resolved_at', { mode: 'date', withTimezone: true }),
    resolvedByAdminId: uuid('resolved_by_admin_id').references(
      () => adminTable.id,
      { onDelete: 'set null' },
    ),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index('review_reports_review_id_idx').on(t.reviewId),
    index('review_reports_reported_by_seller_user_id_idx').on(
      t.reportedBySellerUserId,
    ),
    index('review_reports_status_idx').on(t.status),
  ],
);

export type TReviewReport = typeof reviewReportsTable.$inferSelect;
export type TNewReviewReport = typeof reviewReportsTable.$inferInsert;

export const reviewReportsRelations = relations(
  reviewReportsTable,
  ({ one }) => ({
    review: one(reviewsTable, {
      fields: [reviewReportsTable.reviewId],
      references: [reviewsTable.id],
    }),
    reportedBySeller: one(userTable, {
      fields: [reviewReportsTable.reportedBySellerUserId],
      references: [userTable.id],
    }),
    resolvedByAdmin: one(adminTable, {
      fields: [reviewReportsTable.resolvedByAdminId],
      references: [adminTable.id],
    }),
  }),
);
