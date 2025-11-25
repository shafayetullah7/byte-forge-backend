import {
  businessAccountTable,
  TBusinessAccount,
  TNewBusinessAccount,
} from '@/_db/drizzle/schema';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { eq } from 'drizzle-orm';
import { Injectable } from '@nestjs/common';
import { DrizzleTx } from '@/_db/drizzle/types';

export interface BusinessAccountQuery {
  id?: string;
  ownerId?: string;
  name?: string;
}

@Injectable()
export class BusinessAccountRepository {
  constructor(protected readonly db: DrizzleService) {}

  async findBusinessAccountById(
    businessAccountId: string,
    transaction?: {
      tx: DrizzleTx;
      lock: boolean;
    },
  ): Promise<TBusinessAccount | null> {
    const executor = this.db.getExecutor(transaction?.tx);
    const baseQuery = executor
      .select()
      .from(businessAccountTable)
      .where(eq(businessAccountTable.id, businessAccountId));

    const lockQuery = transaction?.lock ? baseQuery.for('update') : baseQuery;
    const [account] = await lockQuery.execute();

    return account ?? null;
  }

  async findBusinessAccountByOwnerId(
    ownerId: string,
    transaction?: {
      tx: DrizzleTx;
      lock: boolean;
    },
  ): Promise<TBusinessAccount | null> {
    const executor = this.db.getExecutor(transaction?.tx);
    const baseQuery = executor
      .select()
      .from(businessAccountTable)
      .where(eq(businessAccountTable.ownerId, ownerId));

    const lockQuery = transaction?.lock ? baseQuery.for('update') : baseQuery;
    const [account] = await lockQuery.execute();

    return account ?? null;
  }

  async createBusinessAccount(
    businessAccount: TNewBusinessAccount,
    transaction?: DrizzleTx,
  ): Promise<TBusinessAccount> {
    const executor = this.db.getExecutor(transaction);
    const [newAccount] = await executor
      .insert(businessAccountTable)
      .values(businessAccount)
      .returning()
      .execute();

    return newAccount;
  }
}
