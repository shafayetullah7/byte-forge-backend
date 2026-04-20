import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { ShopRepository } from '@/_repositories/business/shop.repository/shop.repository';
import { ShopVerificationRepository } from '@/_repositories/business/shop.verification.repository/shop.verification.repository';
import { ShopVerificationHistoryRepository } from '@/_repositories/business/shop.verification.history.repository/shop.verification.history.repository';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { VerifyShopDto } from './dto/verify-shop.dto';
import { RejectShopDto } from './dto/reject-shop.dto';
import { ShopQueryDto } from './dto/shop-query.dto';
import { DeactivateShopDto } from './dto/deactivate-shop.dto';
import { SuspendShopDto } from './dto/suspend-shop.dto';
import { paginate } from '@/common/utils/pagination.util';
import { PaginationParams } from '@/common/schemas/pagination.schema';
import { and, eq, sql, asc, desc, ilike, count } from 'drizzle-orm';
import { shopTable, shopVerificationTable } from '@/_db/drizzle/schema';
import {
  ShopStatusEnum,
  TShopStatus,
  ShopVerificationStatusEnum,
  ShopVerificationActionEnum,
} from '@/_db/drizzle/enum';

@Injectable()
export class AdminShopService {
  constructor(
    private readonly db: DrizzleService,
    private readonly shopRepository: ShopRepository,
    private readonly shopVerificationRepository: ShopVerificationRepository,
    private readonly shopVerificationHistoryRepository: ShopVerificationHistoryRepository,
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
      const currentVerification = await this.shopVerificationRepository.findOne(
        { shopId },
        tx,
      );

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

      await this.shopVerificationHistoryRepository.create(
        {
          shopId,
          action:
            dto.status === ShopVerificationStatusEnum.APPROVED
              ? ShopVerificationActionEnum.APPROVED
              : ShopVerificationActionEnum.REJECTED,
          previousStatus: currentVerification?.status,
          newStatus: dto.status,
          reason:
            dto.status === ShopVerificationStatusEnum.REJECTED
              ? dto.reason
              : undefined,
          changes: dto.adminNotes ? { adminNotes: dto.adminNotes } : undefined,
        },
        tx,
      );

      return verification;
    });
  }

  async approveShop(shopId: string) {
    return this.db.transaction(async (tx) => {
      // 1. Get current verification record
      const currentVerification = await this.shopVerificationRepository.findOne(
        { shopId },
        tx,
      );

      // 2. Update verification record to APPROVED
      const verifications = await this.shopVerificationRepository.update(
        {
          status: ShopVerificationStatusEnum.APPROVED,
          verifiedAt: new Date(),
          rejectionReason: null,
          adminNotes: null,
        },
        { shopId },
        tx,
      );

      const verification = verifications[0];

      if (!verification) {
        throw new NotFoundException('Verification record not found');
      }

      // 3. Set Shop Status to ACTIVE
      await this.shopRepository.update(
        shopId,
        { status: ShopStatusEnum.ACTIVE },
        tx,
      );

      await this.shopVerificationHistoryRepository.create(
        {
          shopId,
          action: ShopVerificationActionEnum.APPROVED,
          previousStatus: currentVerification?.status,
          newStatus: ShopVerificationStatusEnum.APPROVED,
        },
        tx,
      );

      return verification;
    });
  }

  async rejectShop(shopId: string, dto: RejectShopDto) {
    return this.db.transaction(async (tx) => {
      // 1. Get current verification record
      const currentVerification = await this.shopVerificationRepository.findOne(
        { shopId },
        tx,
      );

      // 2. Update verification record to REJECTED
      const verifications = await this.shopVerificationRepository.update(
        {
          status: ShopVerificationStatusEnum.REJECTED,
          verifiedAt: null,
          rejectionReason: dto.reason,
          adminNotes: dto.adminNotes || null,
        },
        { shopId },
        tx,
      );

      const verification = verifications[0];

      if (!verification) {
        throw new NotFoundException('Verification record not found');
      }

      await this.shopVerificationHistoryRepository.create(
        {
          shopId,
          action: ShopVerificationActionEnum.REJECTED,
          previousStatus: currentVerification?.status,
          newStatus: ShopVerificationStatusEnum.REJECTED,
          reason: dto.reason,
          changes: dto.adminNotes ? { adminNotes: dto.adminNotes } : undefined,
        },
        tx,
      );

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
      status ? eq(shopTable.status, status as TShopStatus) : undefined,
      search ? ilike(shopTable.slug, `%${search}%`) : undefined,
    );

    const [data, [{ total }]] = await Promise.all([
      this.db.client.query.shopTable.findMany({
        where,
        orderBy: [sortFn(sortByField)],
        limit,
        offset,
        with: {
          logo: true,
          translations: true,
          shopAddressTable: {
            with: {
              translations: true,
            },
          },
        },
      }),
      this.db.client
        .select({ total: sql`count(*)`.mapWith(Number) })
        .from(shopTable)
        .where(where)
        .execute(),
    ]);

    // Transform data to include logo URLs and translations
    const transformedData = data.map((shop) => {
      const englishTranslation = shop.translations?.find(
        (t) => t.locale === 'en',
      );
      const addressEnglishTranslation =
        shop.shopAddressTable?.translations?.find(
          (t) => t.locale === 'en',
        );
      return {
        ...shop,
        nameEn: englishTranslation?.name || shop.slug,
        division: addressEnglishTranslation?.division || null,
        city: addressEnglishTranslation?.district || null, // Using district as city
        logoUrl: shop.logo?.url || null,
      };
    });

    return paginate(transformedData, total, page, limit);
  }

  async getShopById(shopId: string) {
    const shop = await this.db.client.query.shopTable.findFirst({
      where: eq(shopTable.id, shopId),
      with: {
        logo: true,
        banner: true,
        translations: true,
        shopAddressTable: {
          with: {
            translations: true,
          },
        },
        shopContactTable: true,
        shopBusinessTable: true,
        shopVerificationTable: {
          with: {
            tradeLicenseMedia: true,
            tinMedia: true,
            utilityBillMedia: true,
          },
        },
      },
    });

    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    const { shopVerificationTable, ...rest } = shop;

    return {
      ...rest,
      verification: shopVerificationTable,
    };
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

      await this.shopVerificationRepository.findOne({ shopId }, tx);

      // Update verification record with suspension info
      await this.shopVerificationRepository.update(
        { status: ShopVerificationStatusEnum.REJECTED },
        { shopId },
        tx,
      );

      await this.shopVerificationHistoryRepository.create(
        {
          shopId,
          action: ShopVerificationActionEnum.SUSPENDED,
          previousStatus: shop.status,
          newStatus: ShopStatusEnum.SUSPENDED,
          reason: dto.reason,
        },
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

    await this.db.transaction(async (tx) => {
      await this.shopRepository.update(
        shopId,
        { status: ShopStatusEnum.INACTIVE },
        tx,
      );

      await this.shopVerificationHistoryRepository.create(
        {
          shopId,
          action: ShopVerificationActionEnum.DEACTIVATED,
          previousStatus: shop.status,
          newStatus: ShopStatusEnum.INACTIVE,
          reason: dto.reason,
        },
        tx,
      );
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

    await this.db.transaction(async (tx) => {
      await this.shopRepository.update(
        shopId,
        { status: ShopStatusEnum.ACTIVE },
        tx,
      );

      await this.shopVerificationHistoryRepository.create(
        {
          shopId,
          action: ShopVerificationActionEnum.REACTIVATED,
          previousStatus: shop.status,
          newStatus: ShopStatusEnum.ACTIVE,
        },
        tx,
      );
    });

    return { message: 'Shop reactivated successfully' };
  }
}
