import { varchar } from 'drizzle-orm/pg-core';
import { pgTable, uuid, text, date, timestamp } from 'drizzle-orm/pg-core';

export const shopTable = pgTable('shops', {
  id: uuid('id').defaultRandom().primaryKey(),
  shopName: varchar('shop_name', { length: 25500 }).notNull(),
  about: text('about'),
  establishDate: date('eestablish_dates', { mode: 'string' }),
  businessType: varchar('business_type', { length: 100 }),
  logo: text('logo'),
  banner: text('banner'),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type TShop = typeof shopTable.$inferSelect;
export type TNewShop = typeof shopTable.$inferInsert;
