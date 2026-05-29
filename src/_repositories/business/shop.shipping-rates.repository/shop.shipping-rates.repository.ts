import { SQL, eq, and, inArray } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { DrizzleTx } from '@/_db/drizzle/types';
import {
  shopShippingRatesTable,
  TShopShippingRate,
  TNewShopShippingRate,
} from '@/_db/drizzle/schema';
import { Injectable } from '@nestjs/common';

export interface ShopShippingRatesQuery {
  shopId?: string;
  districtId?: string;
  districtIds?: string[];
}

@Injectable()
export class ShopShippingRatesRepository {
  constructor(private readonly db: DrizzleService) {}

  private buildWhere(options?: ShopShippingRatesQuery): SQL[] {
    if (!options) return [];

    const where: SQL[] = [];

    if (options.shopId)
      where.push(eq(shopShippingRatesTable.shopId, options.shopId));
    if (options.districtId)
      where.push(eq(shopShippingRatesTable.districtId, options.districtId));
    if (options.districtIds && options.districtIds.length > 0)
      where.push(
        inArray(shopShippingRatesTable.districtId, options.districtIds),
      );

    return where;
  }

  async findByShop(
    shopId: string,
    tx?: DrizzleTx,
  ): Promise<TShopShippingRate[]> {
    const executor = this.db.getExecutor(tx);
    return await executor
      .select()
      .from(shopShippingRatesTable)
      .where(eq(shopShippingRatesTable.shopId, shopId))
      .execute();
  }

  async findByShopAndDistricts(
    shopId: string,
    districtIds: string[],
    tx?: DrizzleTx,
  ): Promise<TShopShippingRate[]> {
    const executor = this.db.getExecutor(tx);
    const where: SQL[] = [eq(shopShippingRatesTable.shopId, shopId)];
    if (districtIds.length > 0) {
      where.push(inArray(shopShippingRatesTable.districtId, districtIds));
    }
    return await executor
      .select()
      .from(shopShippingRatesTable)
      .where(and(...where))
      .execute();
  }

  async upsertBulk(
    shopId: string,
    rates: { districtId: string; cost: string }[],
    tx?: DrizzleTx,
  ): Promise<TShopShippingRate[]> {
    const executor = this.db.getExecutor(tx);

    const values: TNewShopShippingRate[] = rates.map((r) => ({
      shopId,
      districtId: r.districtId,
      cost: r.cost,
    }));

    if (values.length === 0) return [];

    return await executor
      .insert(shopShippingRatesTable)
      .values(values)
      .onConflictDoUpdate({
        target: [shopShippingRatesTable.shopId, shopShippingRatesTable.districtId],
        set: {
          cost: shopShippingRatesTable.cost,
          updatedAt: new Date(),
        },
      })
      .returning();
  }

  async deleteByShop(shopId: string, tx?: DrizzleTx): Promise<void> {
    const executor = this.db.getExecutor(tx);
    await executor
      .delete(shopShippingRatesTable)
      .where(eq(shopShippingRatesTable.shopId, shopId))
      .execute();
  }
}
