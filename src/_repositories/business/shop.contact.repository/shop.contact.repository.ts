import { SQL, eq, and } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import {
  shopContactTable,
  TShopContact,
  TNewShopContact,
} from '@/_db/drizzle/schema';
import { Injectable } from '@nestjs/common';
import { DrizzleTx } from '@/_db/drizzle/types';

export interface ShopContactQuery {
  id?: string;
  shopId?: string;
  phone?: string;
  businessEmail?: string;
}

@Injectable()
export class ShopContactRepository {
  constructor(private readonly db: DrizzleService) {}

  private buildWhere(options?: ShopContactQuery): SQL[] {
    if (!options) return [];

    const where: SQL[] = [];

    if (options.id) where.push(eq(shopContactTable.id, options.id));
    if (options.shopId) where.push(eq(shopContactTable.shopId, options.shopId));
    if (options.phone) where.push(eq(shopContactTable.phone, options.phone));
    if (options.businessEmail)
      where.push(eq(shopContactTable.businessEmail, options.businessEmail));

    return where;
  }

  async findOne(
    options?: ShopContactQuery,
    tx?: DrizzleTx,
  ): Promise<TShopContact | null> {
    const executor = this.db.getExecutor(tx);
    const where = this.buildWhere(options);
    const [row] = await executor
      .select()
      .from(shopContactTable)
      .where(and(...where))
      .limit(1)
      .execute();
    return row ?? null;
  }

  async create(data: TNewShopContact, tx?: DrizzleTx): Promise<TShopContact> {
    const executor = this.db.getExecutor(tx);
    const [row] = await executor
      .insert(shopContactTable)
      .values(data)
      .returning();
    return row;
  }
}
