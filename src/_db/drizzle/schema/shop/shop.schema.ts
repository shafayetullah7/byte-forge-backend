import { varchar } from 'drizzle-orm/pg-core';
import { pgTable, uuid, text, date, timestamp } from 'drizzle-orm/pg-core';
import { userTable } from '../user';
import { mediaTable } from '../media';
import { businessAccountTable } from './business.account.schema';
import { unique } from 'drizzle-orm/pg-core';

export const shopTable = pgTable(
  'shops',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    ownerId: uuid('owner_id')
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
    businessAccountId: uuid('business_account_id')
      .notNull()
      .references(() => businessAccountTable.id, { onDelete: 'cascade' }),
    shopName: varchar('shop_name', { length: 255 }).notNull(),
    about: text('about'),
    establishDate: date('eestablish_dates', { mode: 'string' }),
    businessType: varchar('business_type', { length: 100 }),
    logoId: uuid('logo_id').references(() => mediaTable.id, {
      onDelete: 'no action',
    }),
    bannerId: uuid('banner_id').references(() => mediaTable.id, {
      onDelete: 'no action',
    }),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => {
    return [
      unique('business_account_id_shop_name_unique').on(
        table.businessAccountId,
        table.shopName,
      ),
    ];
  },
);

export type TShop = typeof shopTable.$inferSelect;
export type TNewShop = typeof shopTable.$inferInsert;
