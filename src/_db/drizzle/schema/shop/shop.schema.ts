import { varchar } from 'drizzle-orm/pg-core';
import { pgTable, uuid, text, date, timestamp } from 'drizzle-orm/pg-core';
import { userTable } from '../user';
import { mediaTable } from '../media';

export const shopTable = pgTable('shops', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade' }),
  shopName: varchar('shop_name', { length: 255 }).notNull(),
  about: text('about'),
  establishDate: date('eestablish_dates', { mode: 'string' }),
  businessType: varchar('business_type', { length: 100 }),
  logo: uuid('logo').references(() => mediaTable.id, { onDelete: 'no action' }),
  banner: uuid('banner').references(() => mediaTable.id, {
    onDelete: 'no action',
  }),
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
