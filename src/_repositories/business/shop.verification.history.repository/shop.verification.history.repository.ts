import { Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { DrizzleTx } from '@/_db/drizzle/types';
import {
  shopVerificationHistoryTable,
  TNewShopVerificationHistory,
  TShopVerificationHistory,
} from '@/_db/drizzle/schema/shop/shop.verification.history.schema';
import { eq, desc } from 'drizzle-orm';

interface FindManyOptions {
  orderBy?: {
    createdAt?: 'asc' | 'desc';
  };
}

@Injectable()
export class ShopVerificationHistoryRepository {
  constructor(private readonly db: DrizzleService) {}

  /**
   * Find history entries by shop ID
   */
  async findByShopId(
    shopId: string,
    options?: FindManyOptions,
  ): Promise<TShopVerificationHistory[]> {
    const orderBy =
      options?.orderBy?.createdAt === 'asc'
        ? shopVerificationHistoryTable.createdAt
        : desc(shopVerificationHistoryTable.createdAt);

    return this.db.client.query.shopVerificationHistoryTable.findMany({
      where: eq(shopVerificationHistoryTable.shopId, shopId),
      orderBy,
    });
  }

  async create(
    data: TNewShopVerificationHistory,
    tx?: DrizzleTx,
  ): Promise<TShopVerificationHistory> {
    const executor = this.db.getExecutor(tx);
    const result = await executor
      .insert(shopVerificationHistoryTable)
      .values(data)
      .returning();

    return result[0];
  }

  /**
   * Find one history entry by ID
   */
  async findById(
    id: string,
    tx?: DrizzleTx,
  ): Promise<TShopVerificationHistory> {
    const client = tx || this.db.client;

    const result = await client
      .select()
      .from(shopVerificationHistoryTable)
      .where(eq(shopVerificationHistoryTable.id, id))
      .limit(1);

    if (!result.length) {
      throw new NotFoundException('History entry not found');
    }

    return result[0];
  }
}
