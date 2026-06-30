import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  integer,
  boolean,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { ShopContentModerationStatusEnum } from '../../enum';
import { shopTable } from './shop.schema';
import { mediaTable } from '../media';
import { adminTable } from '../admin/admin.schema';
import { shopContentModerationStatusEnum } from './shop.campaign.schema';
import { shopArticleTranslationsTable } from './shop.article.translation.schema';

export const shopArticlesTable = pgTable(
  'shop_articles',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    shopId: uuid('shop_id')
      .notNull()
      .references(() => shopTable.id, { onDelete: 'cascade' }),
    slug: varchar('slug', { length: 255 }).notNull(),
    coverImageId: uuid('cover_image_id').references(() => mediaTable.id, {
      onDelete: 'set null',
    }),
    category: varchar('category', { length: 100 }),
    readMinutes: integer('read_minutes'),
    isEditorsPick: boolean('is_editors_pick').default(false).notNull(),
    editorsPickByAdminId: uuid('editors_pick_by_admin_id').references(
      () => adminTable.id,
      { onDelete: 'set null' },
    ),
    editorsPickAt: timestamp('editors_pick_at', {
      mode: 'date',
      withTimezone: true,
    }),
    moderationStatus: shopContentModerationStatusEnum('moderation_status')
      .default(ShopContentModerationStatusEnum.DRAFT)
      .notNull(),
    rejectedReason: text('rejected_reason'),
    moderatedByAdminId: uuid('moderated_by_admin_id').references(
      () => adminTable.id,
      { onDelete: 'set null' },
    ),
    moderatedAt: timestamp('moderated_at', {
      mode: 'date',
      withTimezone: true,
    }),
    publishedAt: timestamp('published_at', {
      mode: 'date',
      withTimezone: true,
    }),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    unique().on(t.shopId, t.slug),
    index('shop_articles_shop_id_idx').on(t.shopId),
    index('shop_articles_moderation_status_idx').on(t.moderationStatus),
    index('shop_articles_published_at_idx').on(t.shopId, t.publishedAt),
  ],
);

export type TShopArticle = typeof shopArticlesTable.$inferSelect;
export type TNewShopArticle = typeof shopArticlesTable.$inferInsert;

export const shopArticlesRelations = relations(
  shopArticlesTable,
  ({ one, many }) => ({
    shop: one(shopTable, {
      fields: [shopArticlesTable.shopId],
      references: [shopTable.id],
    }),
    coverImage: one(mediaTable, {
      fields: [shopArticlesTable.coverImageId],
      references: [mediaTable.id],
    }),
    moderatedByAdmin: one(adminTable, {
      fields: [shopArticlesTable.moderatedByAdminId],
      references: [adminTable.id],
    }),
    editorsPickByAdmin: one(adminTable, {
      fields: [shopArticlesTable.editorsPickByAdminId],
      references: [adminTable.id],
    }),
    translations: many(shopArticleTranslationsTable),
  }),
);
