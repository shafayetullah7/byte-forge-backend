import { SQL, eq, and } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import {
  shopSocialMediaTable,
  TShopSocialMedia,
  TNewShopSocialMedia,
} from '@/_db/drizzle/schema';
import { Injectable } from '@nestjs/common';
import { DrizzleTx } from '@/_db/drizzle/types';

export interface ShopSocialMediaQuery {
  id?: string;
  shopId?: string;
  facebook?: string;
  instagram?: string;
  x?: string;
}

@Injectable()
export class ShopSocialMediaRepository {
  constructor(private readonly db: DrizzleService) {}

  private buildWhere(options?: ShopSocialMediaQuery): SQL[] {
    if (!options) return [];

    const where: SQL[] = [];

    if (options.id) where.push(eq(shopSocialMediaTable.id, options.id));
    if (options.shopId)
      where.push(eq(shopSocialMediaTable.shopId, options.shopId));
    if (options.facebook)
      where.push(eq(shopSocialMediaTable.facebook, options.facebook));
    if (options.instagram)
      where.push(eq(shopSocialMediaTable.instagram, options.instagram));
    if (options.x) where.push(eq(shopSocialMediaTable.x, options.x));

    return where;
  }

  async findOne(
    options?: ShopSocialMediaQuery,
    tx?: DrizzleTx,
  ): Promise<TShopSocialMedia | null> {
    const executor = this.db.getExecutor(tx);
    const where = this.buildWhere(options);
    const [row] = await executor
      .select()
      .from(shopSocialMediaTable)
      .where(and(...where))
      .limit(1)
      .execute();
    return row ?? null;
  }

  async create(
    data: TNewShopSocialMedia,
    tx?: DrizzleTx,
  ): Promise<TShopSocialMedia> {
    const executor = this.db.getExecutor(tx);
    const [row] = await executor
      .insert(shopSocialMediaTable)
      .values(data)
      .returning();
    return row;
  }
}
