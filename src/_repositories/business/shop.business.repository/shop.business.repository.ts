import { SQL, eq, and } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import {
  shopBusinessTable,
  TShopBusiness,
  TNewShopBusiness,
} from '@/_db/drizzle/schema';
import { Injectable } from '@nestjs/common';
import { DrizzleTx } from '@/_db/drizzle/types';

export interface ShopBusinessQuery {
  id?: string;
  shopId?: string;
  localDelivery?: boolean;
  nationwideShipping?: boolean;
  inStorePickup?: boolean;
  internationalShipping?: boolean;
}

@Injectable()
export class ShopBusinessRepository {
  constructor(private readonly db: DrizzleService) {}

  private buildWhere(options?: ShopBusinessQuery): SQL[] {
    if (!options) return [];

    const where: SQL[] = [];

    if (options.id) where.push(eq(shopBusinessTable.id, options.id));
    if (options.shopId)
      where.push(eq(shopBusinessTable.shopId, options.shopId));
    if (options.localDelivery !== undefined)
      where.push(eq(shopBusinessTable.localDelivery, options.localDelivery));
    if (options.nationwideShipping !== undefined)
      where.push(
        eq(shopBusinessTable.nationwideShipping, options.nationwideShipping),
      );
    if (options.inStorePickup !== undefined)
      where.push(eq(shopBusinessTable.inStorePickup, options.inStorePickup));
    if (options.internationalShipping !== undefined)
      where.push(
        eq(
          shopBusinessTable.internationalShipping,
          options.internationalShipping,
        ),
      );

    return where;
  }

  async findOne(
    options?: ShopBusinessQuery,
    tx?: DrizzleTx,
  ): Promise<TShopBusiness | null> {
    const executor = this.db.getExecutor(tx);
    const where = this.buildWhere(options);
    const [row] = await executor
      .select()
      .from(shopBusinessTable)
      .where(and(...where))
      .limit(1)
      .execute();
    return row ?? null;
  }

  async create(data: TNewShopBusiness, tx?: DrizzleTx): Promise<TShopBusiness> {
    const executor = this.db.getExecutor(tx);
    const [row] = await executor
      .insert(shopBusinessTable)
      .values(data)
      .returning();
    return row;
  }

  async update(
    data: Partial<TNewShopBusiness>,
    options: ShopBusinessQuery,
    tx?: DrizzleTx,
  ): Promise<TShopBusiness[]> {
    const executor = this.db.getExecutor(tx);
    const where = this.buildWhere(options);
    return await executor
      .update(shopBusinessTable)
      .set(data)
      .where(and(...where))
      .returning()
      .execute();
  }
}
