import { SQL, eq, and } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import {
  userLocalAuthSessionTable,
  TUserLocalAuthSession,
  TNewUserLocalAuthSession,
} from '@/_db/drizzle/schema';
import { Injectable } from '@nestjs/common';
import { DrizzleTx } from '@/_db/drizzle/types';

export interface UserLocalAuthSessionQuery {
  id?: string;
  sessionId?: string;
  localAuthId?: string;
}

@Injectable()
export class UserLocalAuthSessionRepository {
  constructor(private readonly db: DrizzleService) {}

  private buildWhere(options?: UserLocalAuthSessionQuery): SQL[] {
    if (!options) return [];

    const where: SQL[] = [];

    if (options.id) where.push(eq(userLocalAuthSessionTable.id, options.id));
    if (options.sessionId)
      where.push(eq(userLocalAuthSessionTable.sessionId, options.sessionId));
    if (options.localAuthId)
      where.push(
        eq(userLocalAuthSessionTable.localAuthId, options.localAuthId),
      );

    return where;
  }

  async findOne(
    options?: UserLocalAuthSessionQuery,
    tx?: DrizzleTx,
  ): Promise<TUserLocalAuthSession | null> {
    const executor = this.db.getExecutor(tx);
    const where = this.buildWhere(options);
    const [row] = await executor
      .select()
      .from(userLocalAuthSessionTable)
      .where(and(...where))
      .limit(1)
      .execute();
    return row ?? null;
  }

  async create(
    data: TNewUserLocalAuthSession,
    tx?: DrizzleTx,
  ): Promise<TUserLocalAuthSession> {
    const executor = this.db.getExecutor(tx);
    const [row] = await executor
      .insert(userLocalAuthSessionTable)
      .values(data)
      .returning();
    return row;
  }
}
