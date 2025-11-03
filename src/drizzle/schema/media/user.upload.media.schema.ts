import { pgTable, uuid, timestamp } from 'drizzle-orm/pg-core';
import { mediaTable } from './media.schema';
import { userTable } from '../user';

export const userUploadMediaTable = pgTable('user_upload_media', {
  id: uuid('id').defaultRandom().primaryKey(),

  userId: uuid('user_id')
    .unique()
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade' }),

  mediaId: uuid('media_id')
    .notNull()
    .references(() => mediaTable.id, { onDelete: 'cascade' }),

  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type TUserUploadMedia = typeof userUploadMediaTable.$inferSelect;
export type TNewUserUploadMedia = typeof userUploadMediaTable.$inferInsert;
