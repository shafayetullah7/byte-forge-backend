import { TBusinessAccountVerificationStatus } from '@/_db/drizzle/enum';
import { TBusinessAccount, TNewBusinessAccount } from '@/_db/drizzle/schema';
import { PgTransaction } from 'drizzle-orm/pg-core';

/*************  ✨ Windsurf Command ⭐  *************/
export interface IBusinessAccountRepository {
  createBusinessAccount(
    payload: TNewBusinessAccount,
    tx?: PgTransaction<any, any, any>,
  ): Promise<TNewBusinessAccount>;

  deleteBusinessAccount(
    businessAccountId: string,
    tx?: PgTransaction<any, any, any>,
  ): Promise<boolean>;

  findBusinessAccountById(
    businessAccountId: string,
    userId: string,
    transaction?: {
      tx: PgTransaction<any, any, any>;
      lock: boolean;
    },
  ): Promise<TBusinessAccount | null>;

  findBusinessAccounts(options?: {
    id?: string;
    ownerId?: string;
    take?: number;
    skip?: number;
  }): Promise<TBusinessAccount[]>;

  updateBusinessAccountVerificationStatus(
    businessAccountId: string,
    verificationStatus: TBusinessAccountVerificationStatus,
    tx?: PgTransaction<any, any, any>,
  ): Promise<void>;
}
/*******  72f38bf0-9cc6-4f08-a615-2c8e23dd9ad4  *******/
