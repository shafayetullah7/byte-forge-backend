import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import {
  TNewUserLocalAuthSession,
  TUserLocalAuthSession,
  userLocalAuthSessionTable,
} from '@/_db/drizzle/schema';
import { DrizzleTx } from '@/_db/drizzle/types';
import { TLockTransaction } from '@/_repositories/_types/lock.transaction';
import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

@Injectable()
export class UserLocalAuthSessionRepositoryService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async createUserLocalAuthSession(
    payload: TNewUserLocalAuthSession,
    tx?: DrizzleTx,
  ): Promise<TUserLocalAuthSession> {
    const executor = this.drizzleService.getExecutor(tx);
    const [newLocalAuth] = await executor
      .insert(userLocalAuthSessionTable)
      .values(payload)
      .returning()
      .execute();

    return newLocalAuth;
  }

  async getUserLocalAuthSessionById(
    id: string,
    transaction?: TLockTransaction,
  ): Promise<TUserLocalAuthSession> {
    const executor = this.drizzleService.getExecutor(transaction?.tx);
    const baseQuery = executor
      .select()
      .from(userLocalAuthSessionTable)
      .where(eq(userLocalAuthSessionTable.id, id));
    const lockQuery = transaction?.lock ? baseQuery.for('update') : baseQuery;
    const [userLocalAuthSession] = await lockQuery.execute();

    return userLocalAuthSession;
  }
}
