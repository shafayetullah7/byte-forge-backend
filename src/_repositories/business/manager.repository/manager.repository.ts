import { SQL, eq, and } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { managerTable, TManager, TNewManager } from '@/_db/drizzle/schema';
import { Injectable } from '@nestjs/common';
import { DrizzleTx } from '@/_db/drizzle/types';

export interface ManagerQuery {
  id?: string;
  userId?: string;
  verified?: boolean;
  phone?: string;
}

@Injectable()
export class ManagerRepository {
  constructor(private readonly db: DrizzleService) {}

  private buildWhere(options?: ManagerQuery): SQL[] {
    if (!options) return [];

    const where: SQL[] = [];

    if (options.id) where.push(eq(managerTable.id, options.id));
    if (options.userId) where.push(eq(managerTable.userId, options.userId));
    if (options.verified !== undefined)
      where.push(eq(managerTable.verified, options.verified));
    if (options.phone) where.push(eq(managerTable.phone, options.phone));

    return where;
  }

  async findOne(
    options?: ManagerQuery,
    tx?: DrizzleTx,
  ): Promise<TManager | null> {
    const executor = this.db.getExecutor(tx);
    const where = this.buildWhere(options);
    const [row] = await executor
      .select()
      .from(managerTable)
      .where(and(...where))
      .limit(1)
      .execute();
    return row ?? null;
  }

  async create(data: TNewManager, tx?: DrizzleTx): Promise<TManager> {
    const executor = this.db.getExecutor(tx);
    const [row] = await executor.insert(managerTable).values(data).returning();
    return row;
  }
}
