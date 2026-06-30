import { pgTable, uuid, varchar, text, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { shopArticlesTable } from './shop.article.schema';
import { languagesTable } from '../i18n/language.schema';

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
