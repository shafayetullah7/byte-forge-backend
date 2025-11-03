import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { mediaTable } from './media.schema';

export const cloudinaryMediaTable = pgTable('cloudinary_media', {
  id: uuid('id').defaultRandom().primaryKey(),

  mediaId: uuid('media_id')
    .notNull()
    .unique()
    .references(() => mediaTable.id, { onDelete: 'cascade' }),

  publicKey: varchar('public_key', { length: 255 }).notNull(),

  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type TCloudinaryMedia = typeof cloudinaryMediaTable.$inferSelect;
export type TNewCloudinaryMedia = typeof cloudinaryMediaTable.$inferInsert;
