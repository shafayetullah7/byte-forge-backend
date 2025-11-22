import { Injectable } from '@nestjs/common';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import {
  businessAccountTable,
  TBusinessAccount,
  TNewBusinessAccount,
} from '@/_db/drizzle/schema';
import { IBusinessAccountRepository } from './interfaces/business.account.repository.interface';
import { and, eq, SQL } from 'drizzle-orm';
import { TBusinessAccountVerificationStatus } from '@/_db/drizzle/enum';
import { DrizzleTx } from '@/_db/drizzle/types';
@Injectable()
export class BusinessAccountRepository implements IBusinessAccountRepository {
  constructor(private readonly db: DrizzleService) {}

  async createBusinessAccount(
    payload: TNewBusinessAccount,
    tx?: PgTransaction<any, any, any>,
  ): Promise<TNewBusinessAccount> {
    const executor = this.getExecutor(tx);
    const [newBusinessAccount] = await executor
      .insert(businessAccountTable)
      .values(payload)
      .returning()
      .execute();

    return newBusinessAccount;
  }

  async deleteBusinessAccount(
    businessAccountId: string,
    tx?: PgTransaction<any, any, any>,
  ): Promise<boolean> {
    const executor = this.getExecutor(tx);
    const deletedBusinessAccounts = await executor
      .delete(businessAccountTable)
      .where(eq(businessAccountTable.id, businessAccountId))
      .returning()
      .execute();

    return !!deletedBusinessAccounts.length;
  }

  async findBusinessAccountById(
    businessAccountId: string,
    userId: string,
    transaction?: {
      tx: PgTransaction<any, any, any>;
      lock: boolean;
    },
  ): Promise<TBusinessAccount | null> {
    const executor = this.getExecutor(transaction?.tx);
    const [businessAccount] = await executor
      .select()
      .from(businessAccountTable)
      .where(
        and(
          eq(businessAccountTable.id, businessAccountId),
          eq(businessAccountTable.ownerId, userId),
        ),
      );
    return businessAccount ?? null;
  }

  async findBusinessAccounts(options?: {
    id?: string;
    ownerId?: string;
  }): Promise<TBusinessAccount[]> {
    const executor = this.getExecutor();

    const filters: SQL[] = [];

    if (options?.id) {
      filters.push(eq(businessAccountTable.id, options.id));
    }

    if (options?.ownerId) {
      filters.push(eq(businessAccountTable.ownerId, options.ownerId));
    }

    const query = executor
      .select()
      .from(businessAccountTable)
      .where(filters.length ? and(...filters) : undefined);

    return await query.execute();
  }

  async updateBusinessAccountVerificationStatus(
    businessAccountId: string,
    verificationStatus: TBusinessAccountVerificationStatus,
    tx?: PgTransaction<any, any, any>,
  ): Promise<void> {
    const executor = this.getExecutor(tx);
    await executor
      .update(businessAccountTable)
      .set({ verificationStatus: verificationStatus })
      .where(eq(businessAccountTable.id, businessAccountId));
  }

  private getExecutor(tx?: DrizzleTx) {
    return tx ?? this.db.client;
  }
}
