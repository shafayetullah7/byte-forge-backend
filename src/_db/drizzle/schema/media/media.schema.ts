import {
  pgTable,
  uuid,
  varchar,
  integer,
  text,
  timestamp,
  json,
} from 'drizzle-orm/pg-core';
import { AllowedMimeType } from '../../enum/mime.type.enum';
import { pgEnum } from 'drizzle-orm/pg-core';

export type MediaUse = {
  table: string;
  recordId: string;
};

export type MediaUses = MediaUse[];
export const MimeTypeEnum = pgEnum('mime_type_enum', AllowedMimeType);

export const mediaTable = pgTable('media', {
  id: uuid('id').defaultRandom().primaryKey(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  // mimeType: varchar('mime_type', { length: 100 }).notNull(),
  mimeType: MimeTypeEnum('mime_type').notNull(),
  size: integer('size').notNull(),
  url: text('url').notNull(),

  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),

  usesCount: integer('uses_count').default(0).notNull(),

  uses: json('uses').$type<MediaUses | null>().default(null), // <-- typed JSON column
});

export type TMedia = typeof mediaTable.$inferSelect;
export type TNewMedia = typeof mediaTable.$inferInsert;
