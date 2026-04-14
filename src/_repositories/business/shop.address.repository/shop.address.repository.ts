import { SQL, eq, and } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import {
  shopAddressTable,
  TShopAddress,
  TNewShopAddress,
} from '@/_db/drizzle/schema';
import { Injectable } from '@nestjs/common';
import { DrizzleTx } from '@/_db/drizzle/types';

export interface ShopAddressQuery {
  id?: string;
  shopId?: string;
  isVerified?: boolean;
}

@Injectable()
export class ShopAddressRepository {
  constructor(private readonly db: DrizzleService) {}

  private buildWhere(q?: ShopAddressQuery): SQL[] {
    if (!q) return [];

    const where: SQL[] = [];

    if (q.id) where.push(eq(shopAddressTable.id, q.id));
    if (q.shopId) where.push(eq(shopAddressTable.shopId, q.shopId));
    if (q.isVerified !== undefined)
      where.push(eq(shopAddressTable.isVerified, q.isVerified));

    return where;
  }

  async findOne(
    options?: ShopAddressQuery,
    tx?: DrizzleTx,
  ): Promise<TShopAddress | null> {
    const executor = this.db.getExecutor(tx);
    const where = this.buildWhere(options);
    const [row] = await executor
      .select()
      .from(shopAddressTable)
      .where(and(...where))
      .limit(1)
      .execute();
    return row ?? null;
  }

  async create(data: TNewShopAddress, tx?: DrizzleTx): Promise<TShopAddress> {
    const executor = this.db.getExecutor(tx);
    const [row] = await executor
      .insert(shopAddressTable)
      .values(data)
      .returning();
    return row;
  }

  async update(
    data: Partial<TNewShopAddress>,
    options: ShopAddressQuery,
    tx?: DrizzleTx,
  ): Promise<TShopAddress[]> {
    const executor = this.db.getExecutor(tx);
    const where = this.buildWhere(options);
    return await executor
      .update(shopAddressTable)
      .set(data)
      .where(and(...where))
      .returning()
      .execute();
  }
}
