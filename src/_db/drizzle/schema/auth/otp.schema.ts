import { pgTable, uuid, varchar, timestamp, unique } from 'drizzle-orm/pg-core';
import { userTable } from '../user/user.schema';
import { OtpPurpose } from '@/_db/drizzle/enum/otp.purpose.enum';

export const otpTable = pgTable(
  'otps',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
    hashedOtp: varchar('hashed_otp', { length: 255 }).notNull(),
    purpose: varchar('purpose', { length: 50 }).$type<OtpPurpose>().notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // Ensure only one active OTP per user per purpose
    unique().on(table.userId, table.purpose),
  ],
);

export type TOtp = typeof otpTable.$inferSelect;
export type TNewOtp = typeof otpTable.$inferInsert;
