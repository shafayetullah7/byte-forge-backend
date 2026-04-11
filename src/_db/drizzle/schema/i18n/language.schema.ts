import { pgTable, varchar, boolean } from 'drizzle-orm/pg-core';

export const languagesTable = pgTable('languages', {
  code: varchar('code', { length: 10 }).primaryKey(), // e.g. 'en', 'bn', 'ar'
  name: varchar('name', { length: 100 }).notNull(), // e.g. 'English', 'Bengali'
  isRtl: boolean('is_rtl').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
});

export type TLanguage = typeof languagesTable.$inferSelect;
export type TNewLanguage = typeof languagesTable.$inferInsert;
