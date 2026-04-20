import { varchar, pgEnum } from 'drizzle-orm/pg-core';
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { userTable } from '../user';
import { mediaTable } from '../media';
import { ShopStatusEnum } from '../../enum';
import { shopVerificationTable } from './shop.verification.schema';
import { shopAddressTable } from './shop.address.schema';
import { shopBusinessTable } from './shop.business.schema';
import { shopTranslationsTable } from './shop.translation.schema';
import { shopContactTable } from './shop.contact.schema';

export const shopStatusEnum = pgEnum('shop_status_enum', [
  ShopStatusEnum.DRAFT,
  ShopStatusEnum.PENDING_VERIFICATION,
  ShopStatusEnum.APPROVED,
  ShopStatusEnum.ACTIVE,
  ShopStatusEnum.INACTIVE,
  ShopStatusEnum.REJECTED,
  ShopStatusEnum.SUSPENDED,
  ShopStatusEnum.DELETED,
]);

export const shopTable = pgTable('shops', {
  id: uuid('id').defaultRandom().primaryKey(),
  ownerId: uuid('owner_id')
    .notNull()
    .unique()
    .references(() => userTable.id, { onDelete: 'cascade' }),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  status: shopStatusEnum('status').default(ShopStatusEnum.DRAFT).notNull(),

  // First-Class Branding
  primaryColor: varchar('primary_color', { length: 7 }), // hex code
  secondaryColor: varchar('secondary_color', { length: 7 }),
  accentColor: varchar('accent_color', { length: 7 }),

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
});

export const shopRelations = relations(shopTable, ({ one, many }) => ({
  owner: one(userTable, {
    fields: [shopTable.ownerId],
    references: [userTable.id],
  }),
  translations: many(shopTranslationsTable),
  shopVerificationTable: one(shopVerificationTable, {
    fields: [shopTable.id],
    references: [shopVerificationTable.shopId],
  }),
  shopAddressTable: one(shopAddressTable, {
    fields: [shopTable.id],
    references: [shopAddressTable.shopId],
  }),
  shopBusinessTable: one(shopBusinessTable, {
    fields: [shopTable.id],
    references: [shopBusinessTable.shopId],
  }),
  logo: one(mediaTable, {
    fields: [shopTable.logoId],
    references: [mediaTable.id],
  }),
  banner: one(mediaTable, {
    fields: [shopTable.bannerId],
    references: [mediaTable.id],
  }),
  shopContactTable: one(shopContactTable, {
    fields: [shopTable.id],
    references: [shopContactTable.shopId],
  }),
}));

export type TShop = typeof shopTable.$inferSelect;
export type TNewShop = typeof shopTable.$inferInsert;
