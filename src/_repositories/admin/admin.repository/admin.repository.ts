import { SQL, eq, and } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { adminTable, TAdmin } from '@/_db/drizzle/schema';
import { Injectable } from '@nestjs/common';
import { DrizzleTx } from '@/_db/drizzle/types';

export interface AdminQuery {
  id?: string;
  userName?: string;
  firstName?: string;
  lastName?: string;
}

@Injectable()
export class AdminRepository {
  constructor(private readonly db: DrizzleService) {}

  private buildWhere(options?: AdminQuery): SQL[] {
    if (!options) return [];

    const where: SQL[] = [];

    if (options.id) where.push(eq(adminTable.id, options.id));
    if (options.userName) where.push(eq(adminTable.userName, options.userName));
    if (options.firstName)
      where.push(eq(adminTable.firstName, options.firstName));
    if (options.lastName) where.push(eq(adminTable.lastName, options.lastName));

    return where;
  }

  async findOne(options?: AdminQuery, tx?: DrizzleTx): Promise<TAdmin | null> {
    const executor = this.db.getExecutor(tx);
    const where = this.buildWhere(options);
    const [row] = await executor
      .select()
      .from(adminTable)
      .where(and(...where))
      .limit(1)
      .execute();
    return row ?? null;
  }
}
