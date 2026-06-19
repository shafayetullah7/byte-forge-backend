import { pgTable, uuid, timestamp, unique } from 'drizzle-orm/pg-core';
import { mediaTable } from './media.schema';
import { adminTable } from '../admin';

export const adminUploadMediaTable = pgTable(
  'admin_upload_media',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    adminId: uuid('admin_id')
      .notNull()
      .references(() => adminTable.id, { onDelete: 'cascade' }),
    mediaId: uuid('media_id')
      .notNull()
      .references(() => mediaTable.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    adminMediaUnique: unique('admin_media_unique').on(
      table.mediaId,
      table.adminId,
    ),
  }),
);

export type TAdminUploadMedia = typeof adminUploadMediaTable.$inferSelect;
export type TNewAdminUploadMedia = typeof adminUploadMediaTable.$inferInsert;
