import { SQL, eq, and } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import {
  userSessionTable,
  TUserSession,
  TNewUserSession,
} from '@/_db/drizzle/schema';
import { Injectable } from '@nestjs/common';
import { DrizzleTx } from '@/_db/drizzle/types';

export interface UserSessionQuery {
  id?: string;
  userId?: string;
  sessionId?: string;
}

@Injectable()
export class UserSessionRepository {
  constructor(private readonly db: DrizzleService) {}

  private buildWhere(options?: UserSessionQuery): SQL[] {
    if (!options) return [];

    const where: SQL[] = [];

    if (options.id) where.push(eq(userSessionTable.id, options.id));
    if (options.userId) where.push(eq(userSessionTable.userId, options.userId));
    if (options.sessionId)
      where.push(eq(userSessionTable.sessionId, options.sessionId));

    return where;
  }

  async findOne(
    options?: UserSessionQuery,
    tx?: DrizzleTx,
  ): Promise<TUserSession | null> {
    const executor = this.db.getExecutor(tx);
    const where = this.buildWhere(options);
    const [row] = await executor
      .select()
      .from(userSessionTable)
      .where(and(...where))
      .limit(1)
      .execute();
    return row ?? null;
  }

  async create(data: TNewUserSession, tx?: DrizzleTx): Promise<TUserSession> {
    const executor = this.db.getExecutor(tx);
    const [row] = await executor
      .insert(userSessionTable)
      .values(data)
      .returning();
    return row;
  }

  async delete(where: SQL, tx?: DrizzleTx): Promise<boolean> {
    const executor = this.db.getExecutor(tx);
    const deleted = await executor
      .delete(userSessionTable)
      .where(where)
      .returning()
      .execute();
    return deleted.length > 0;
  }
}
