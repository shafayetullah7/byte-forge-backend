import { SQL, eq, and } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import {
  adminLocalAuthSessionTable,
  TAdminLocalAuthSession,
  TNewAdminLocalAuthSession,
} from '@/_db/drizzle/schema';
import { Injectable } from '@nestjs/common';
import { DrizzleTx } from '@/_db/drizzle/types';

export interface AdminLocalAuthSessionQuery {
  id?: string;
  sessionId?: string;
  localAuthId?: string;
}

@Injectable()
export class AdminLocalAuthSessionRepository {
  constructor(private readonly db: DrizzleService) {}

  private buildWhere(options?: AdminLocalAuthSessionQuery): SQL[] {
    if (!options) return [];

    const where: SQL[] = [];

    if (options.id) where.push(eq(adminLocalAuthSessionTable.id, options.id));
    if (options.sessionId)
      where.push(eq(adminLocalAuthSessionTable.sessionId, options.sessionId));
    if (options.localAuthId)
      where.push(
        eq(adminLocalAuthSessionTable.localAuthId, options.localAuthId),
      );

    return where;
  }

  async findOne(
    options?: AdminLocalAuthSessionQuery,
    tx?: DrizzleTx,
  ): Promise<TAdminLocalAuthSession | null> {
    const executor = this.db.getExecutor(tx);
    const where = this.buildWhere(options);
    const [row] = await executor
      .select()
      .from(adminLocalAuthSessionTable)
      .where(and(...where))
      .limit(1)
      .execute();
    return row ?? null;
  }

  async create(
    data: TNewAdminLocalAuthSession,
    tx?: DrizzleTx,
  ): Promise<TAdminLocalAuthSession> {
    const executor = this.db.getExecutor(tx);
    const [row] = await executor
      .insert(adminLocalAuthSessionTable)
      .values(data)
      .returning();
    return row;
  }
}
