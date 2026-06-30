import { pgTable, uuid, varchar, text, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { shopArticlesTable } from './shop.article.schema';
import { languagesTable } from '../i18n/language.schema';
import { shopTable } from './shop.schema';
import { mediaTable } from '../media';
import { adminTable } from '../admin/admin.schema';

export const shopArticleTranslationsTable = pgTable(
  'shop_article_translations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    articleId: uuid('article_id')
      .notNull()
      .references(() => shopArticlesTable.id, { onDelete: 'cascade' }),
    locale: varchar('locale', { length: 10 })
      .notNull()
      .references(() => languagesTable.code),
    title: varchar('title', { length: 255 }).notNull(),
    excerpt: text('excerpt'),
    body: text('body'),
  },
  (t) => [unique().on(t.articleId, t.locale)],
);

export type TShopArticleTranslation =
  typeof shopArticleTranslationsTable.$inferSelect;
export type TNewShopArticleTranslation =
  typeof shopArticleTranslationsTable.$inferInsert;

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

export const shopArticleTranslationsRelations = relations(
  shopArticleTranslationsTable,
  ({ one }) => ({
    article: one(shopArticlesTable, {
      fields: [shopArticleTranslationsTable.articleId],
      references: [shopArticlesTable.id],
    }),
    language: one(languagesTable, {
      fields: [shopArticleTranslationsTable.locale],
      references: [languagesTable.code],
    }),
  }),
);
