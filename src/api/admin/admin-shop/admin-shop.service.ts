import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { ShopRepository } from '@/_repositories/business/shop.repository/shop.repository';
import { ShopVerificationRepository } from '@/_repositories/business/shop.verification.repository/shop.verification.repository';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { VerifyShopDto } from './dto/verify-shop.dto';
import { ShopStatusEnum, ShopVerificationStatusEnum } from '@/_db/drizzle/enum';
import { ShopQueryDto } from './dto/shop-query.dto';
import { DeactivateShopDto } from './dto/deactivate-shop.dto';
import { SuspendShopDto } from './dto/suspend-shop.dto';
import { paginate } from '@/common/utils/pagination.util';
import { PaginationParams } from '@/common/schemas/pagination.schema';
import { and, eq, sql, asc, desc, ilike, or, count } from 'drizzle-orm';
import { shopTable, shopVerificationTable } from '@/_db/drizzle/schema';

@Injectable()
export class AdminShopService {
  constructor(
    private readonly db: DrizzleService,
    private readonly shopRepository: ShopRepository,
    private readonly shopVerificationRepository: ShopVerificationRepository,
  ) {}

  async getPendingVerifications(query: PaginationParams) {
    const { limit = 20, page = 1 } = query;
    const offset = (page - 1) * limit;

    const whereClause = eq(
      shopVerificationTable.status,
      ShopVerificationStatusEnum.PENDING,
    );

    const [data, [{ total }]] = await Promise.all([
      this.db.client.query.shopVerificationTable.findMany({
        where: whereClause,
        with: {
          shop: {
            with: {
              translations: true,
            },
          },
        },
        limit,
        offset,
        orderBy: desc(shopVerificationTable.createdAt),
      }),
      this.db.client
        .select({ total: count() })
        .from(shopVerificationTable)
        .where(whereClause)
        .execute(),
    ]);

    return paginate(data, total, page, limit);
  }

  async verifyShop(shopId: string, dto: VerifyShopDto) {
    return this.db.transaction(async (tx) => {
      // 1. Update Verification Status
      const verifications = await this.shopVerificationRepository.update(
        {
          status: dto.status,
          verifiedAt:
            dto.status === ShopVerificationStatusEnum.APPROVED
              ? new Date()
              : null,
          rejectionReason:
            dto.status === ShopVerificationStatusEnum.REJECTED
              ? dto.reason
              : null,
          adminNotes: dto.adminNotes || null,
        },
        { shopId },
        tx,
      );

      const verification = verifications[0];

      if (!verification) {
        throw new NotFoundException('Verification record not found');
      }

      // 2. If Approved, set Shop Status to ACTIVE
      if (dto.status === ShopVerificationStatusEnum.APPROVED) {
        await this.shopRepository.update(
          shopId,
          { status: ShopStatusEnum.ACTIVE },
          tx,
        );
      }

      return verification;
    });
  }

  async getAllShops(query: ShopQueryDto) {
    const { status, search, limit = 20, page = 1, sortBy, sortOrder } = query;
    const offset = (page - 1) * limit;

    const sortFn = sortOrder === 'asc' ? asc : desc;
    const sortByField =
      sortBy === 'updatedAt' ? shopTable.updatedAt : shopTable.createdAt;

    const where = and(
      status ? eq(shopTable.status, status as any) : undefined,
      search ? ilike(shopTable.slug, `%${search}%`) : undefined,
    );

    const [data, [{ total }]] = await Promise.all([
      this.db.client.query.shopTable.findMany({
        where,
        orderBy: [sortFn(sortByField)],
        limit,
        offset,
      }),
      this.db.client
        .select({ total: sql`count(*)`.mapWith(Number) })
        .from(shopTable)
        .where(where)
        .execute(),
    ]);

    return paginate(data, total, page, limit);
  }

  async getShopById(shopId: string) {
    const shop = await this.db.client.query.shopTable.findFirst({
      where: eq(shopTable.id, shopId),
      with: {
        logo: true,
        banner: true,
      },
    });

    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    return shop;
  }

  async getShopStats() {
    const [stats, verificationCount] = await Promise.all([
      this.db.client
        .select({
          totalShops: count(),
          pendingShops:
            sql<number>`SUM(CASE WHEN ${shopTable.status} = ${ShopStatusEnum.PENDING_VERIFICATION} THEN 1 ELSE 0 END)`.mapWith(
              Number,
            ),
          activeShops:
            sql<number>`SUM(CASE WHEN ${shopTable.status} = ${ShopStatusEnum.ACTIVE} THEN 1 ELSE 0 END)`.mapWith(
              Number,
            ),
          suspendedShops:
            sql<number>`SUM(CASE WHEN ${shopTable.status} = ${ShopStatusEnum.SUSPENDED} THEN 1 ELSE 0 END)`.mapWith(
              Number,
            ),
          inactiveShops:
            sql<number>`SUM(CASE WHEN ${shopTable.status} = ${ShopStatusEnum.INACTIVE} THEN 1 ELSE 0 END)`.mapWith(
              Number,
            ),
        })
        .from(shopTable),
      this.db.client
        .select({ total: count() })
        .from(shopVerificationTable)
        .where(
          eq(shopVerificationTable.status, ShopVerificationStatusEnum.PENDING),
        ),
    ]);

    const stat = stats[0];

    return {
      totalShops: stat?.totalShops || 0,
      pendingShops: stat?.pendingShops || 0,
      activeShops: stat?.activeShops || 0,
      suspendedShops: stat?.suspendedShops || 0,
      inactiveShops: stat?.inactiveShops || 0,
      pendingVerifications: verificationCount[0]?.total || 0,
    };
  }

  async suspendShop(shopId: string, dto: SuspendShopDto) {
    const shop = await this.shopRepository.getShopById(shopId);

    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    if (shop.status !== ShopStatusEnum.ACTIVE) {
      throw new BadRequestException('Only active shops can be suspended');
    }

    await this.db.transaction(async (tx) => {
      await this.shopRepository.update(
        shopId,
        { status: ShopStatusEnum.SUSPENDED },
        tx,
      );

      // Update verification record with suspension info
      await this.shopVerificationRepository.update(
        { status: ShopVerificationStatusEnum.REJECTED },
        { shopId },
        tx,
      );
    });

    return { message: 'Shop suspended successfully' };
  }

  async deactivateShop(shopId: string, dto: DeactivateShopDto) {
    const shop = await this.shopRepository.getShopById(shopId);

    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    if (shop.status === ShopStatusEnum.INACTIVE) {
      throw new BadRequestException('Shop is already deactivated');
    }

    await this.shopRepository.update(shopId, {
      status: ShopStatusEnum.INACTIVE,
    });

    return { message: 'Shop deactivated successfully' };
  }

  async reactivateShop(shopId: string) {
    const shop = await this.shopRepository.getShopById(shopId);

    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    if (
      shop.status !== ShopStatusEnum.SUSPENDED &&
      shop.status !== ShopStatusEnum.INACTIVE
    ) {
      throw new BadRequestException(
        'Only suspended or deactivated shops can be reactivated',
      );
    }

    await this.shopRepository.update(shopId, {
      status: ShopStatusEnum.ACTIVE,
    });

    return { message: 'Shop reactivated successfully' };
  }
}
