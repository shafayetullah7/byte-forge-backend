import { Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../../../_db/drizzle/drizzle.service';
import {
  shopTable,
  shopTranslationsTable,
} from '../../../_db/drizzle/schema/shop';
import { shopVerificationHistoryTable } from '../../../_db/drizzle/schema/shop/shop.verification.history.schema';
import { ListShopsDto } from './dto/list-shops.dto';
import { ApproveShopDto } from './dto/approve-shop.dto';
import { RejectShopDto } from './dto/reject-shop.dto';
import { SuspendShopDto } from './dto/suspend-shop.dto';
import { eq, and, like, or, desc, count } from 'drizzle-orm';
import { ShopStatusEnum } from '../../../_db/drizzle/enum';

@Injectable()
export class ShopsService {
  constructor(private readonly db: DrizzleService) {}

  async findAll(query: ListShopsDto) {
    const { status, search, page = 1, limit = 20 } = query;
    const offset = (page - 1) * limit;

    const [shops, totalResult] = await Promise.all([
      this.db.client
        .select({
          id: shopTable.id,
          ownerId: shopTable.ownerId,
          slug: shopTable.slug,
          status: shopTable.status,
          createdAt: shopTable.createdAt,
          updatedAt: shopTable.updatedAt,
          nameEn: shopTranslationsTable.name,
        })
        .from(shopTable)
        .leftJoin(
          shopTranslationsTable,
          and(
            eq(shopTranslationsTable.shopId, shopTable.id),
            eq(shopTranslationsTable.locale, 'en'),
          ),
        )
        .where(
          status
            ? eq(shopTable.status, status)
            : search
              ? or(
                  like(shopTable.slug, `%${search}%`),
                  like(shopTranslationsTable.name, `%${search}%`),
                )
              : undefined,
        )
        .orderBy(desc(shopTable.createdAt))
        .limit(limit)
        .offset(offset),
      this.db.client
        .select({ count: count() })
        .from(shopTable)
        .where(
          status
            ? eq(shopTable.status, status)
            : search
              ? or(
                  like(shopTable.slug, `%${search}%`),
                  like(shopTranslationsTable.name, `%${search}%`),
                )
              : undefined,
        ),
    ]);

    const total = totalResult[0]?.count || 0;

    return {
      data: shops,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const [shop] = await this.db.client
      .select({
        shop: shopTable,
        translations: shopTranslationsTable,
      })
      .from(shopTable)
      .leftJoin(
        shopTranslationsTable,
        eq(shopTranslationsTable.shopId, shopTable.id),
      )
      .where(eq(shopTable.id, id))
      .limit(1);

    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    return shop;
  }

  async approve(id: string, dto: ApproveShopDto) {
    const [shop] = await this.db.client
      .select()
      .from(shopTable)
      .where(eq(shopTable.id, id))
      .limit(1);

    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    await this.db.client
      .update(shopTable)
      .set({ status: ShopStatusEnum.APPROVED })
      .where(eq(shopTable.id, id));

    await this.db.client.insert(shopVerificationHistoryTable).values({
      shopId: id,
      action: 'approved',
      previousStatus: shop.status,
      newStatus: ShopStatusEnum.APPROVED,
      createdAt: new Date(),
    });

    return { success: true, message: 'Shop approved successfully' };
  }

  async reject(id: string, dto: RejectShopDto) {
    const [shop] = await this.db.client
      .select()
      .from(shopTable)
      .where(eq(shopTable.id, id))
      .limit(1);

    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    await this.db.client
      .update(shopTable)
      .set({ status: ShopStatusEnum.REJECTED })
      .where(eq(shopTable.id, id));

    await this.db.client.insert(shopVerificationHistoryTable).values({
      shopId: id,
      action: 'rejected',
      previousStatus: shop.status,
      newStatus: ShopStatusEnum.REJECTED,
      reason: dto.reason,
      createdAt: new Date(),
    });

    return { success: true, message: 'Shop rejected' };
  }

  async suspend(id: string, dto: SuspendShopDto) {
    const [shop] = await this.db.client
      .select()
      .from(shopTable)
      .where(eq(shopTable.id, id))
      .limit(1);

    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    await this.db.client
      .update(shopTable)
      .set({ status: ShopStatusEnum.SUSPENDED })
      .where(eq(shopTable.id, id));

    await this.db.client.insert(shopVerificationHistoryTable).values({
      shopId: id,
      action: 'suspended',
      previousStatus: shop.status,
      newStatus: ShopStatusEnum.SUSPENDED,
      reason: dto.reason,
      createdAt: new Date(),
    });

    return { success: true, message: 'Shop suspended' };
  }

  async getVerificationHistory(id: string) {
    const history = await this.db.client
      .select()
      .from(shopVerificationHistoryTable)
      .where(eq(shopVerificationHistoryTable.shopId, id))
      .orderBy(desc(shopVerificationHistoryTable.createdAt));

    return history;
  }
}
