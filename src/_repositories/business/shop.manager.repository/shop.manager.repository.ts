import { SQL, eq, and } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import {
  shopManagerTable,
  TShopManager,
  TNewShopManager,
} from '@/_db/drizzle/schema';
import { Injectable } from '@nestjs/common';
import { DrizzleTx } from '@/_db/drizzle/types';

export interface ShopManagerQuery {
  id?: string;
  shopId?: string;
  managerId?: string;
  isPrimary?: boolean;
}

@Injectable()
export class ShopManagerRepository {
  constructor(private readonly db: DrizzleService) {}

  private buildWhere(options?: ShopManagerQuery): SQL[] {
    if (!options) return [];

    const where: SQL[] = [];

    if (options.id) where.push(eq(shopManagerTable.id, options.id));
    if (options.shopId) where.push(eq(shopManagerTable.shopId, options.shopId));
    if (options.managerId)
      where.push(eq(shopManagerTable.managerId, options.managerId));
    if (options.isPrimary !== undefined)
      where.push(eq(shopManagerTable.isPrimary, options.isPrimary));

    return where;
  }

  async findOne(
    options?: ShopManagerQuery,
    tx?: DrizzleTx,
  ): Promise<TShopManager | null> {
    const executor = this.db.getExecutor(tx);
    const where = this.buildWhere(options);
    const [row] = await executor
      .select()
      .from(shopManagerTable)
      .where(and(...where))
      .limit(1)
      .execute();
    return row ?? null;
  }

  async create(data: TNewShopManager, tx?: DrizzleTx): Promise<TShopManager> {
    const executor = this.db.getExecutor(tx);
    const [row] = await executor
      .insert(shopManagerTable)
      .values(data)
      .returning();
    return row;
  }
}
