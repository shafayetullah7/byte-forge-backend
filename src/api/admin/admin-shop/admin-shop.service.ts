import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { ShopRepository } from '@/_repositories/business/shop.repository/shop.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { VerifyShopDto } from './dto/verify-shop.dto';
import {
  shopTable,
  shopVerificationTable,
} from '@/_db/drizzle/schema';
import { ShopStatusEnum, ShopVerificationStatusEnum } from '@/_db/drizzle/enum';
import { eq } from 'drizzle-orm';

@Injectable()
export class AdminShopService {
  constructor(
    private readonly db: DrizzleService,
    private readonly shopRepository: ShopRepository,
  ) {}

  async getPendingVerifications() {
    return this.db.client.query.shopVerificationTable.findMany({
      where: eq(shopVerificationTable.status, ShopVerificationStatusEnum.PENDING),
      with: {
        shop: {
          with: {
            translations: true,
          },
        },
      },
    });
  }

  async verifyShop(shopId: string, dto: VerifyShopDto) {
    return this.db.transaction(async (tx) => {
      // 1. Update Verification Status
      const [verification] = await tx
        .update(shopVerificationTable)
        .set({
          status: dto.status,
          verifiedAt:
            dto.status === ShopVerificationStatusEnum.APPROVED
              ? new Date()
              : null,
        })
        .where(eq(shopVerificationTable.shopId, shopId))
        .returning();

      if (!verification) {
        throw new NotFoundException('Verification record not found');
      }

      // 2. If Approved, set Shop Status to ACTIVE
      if (dto.status === ShopVerificationStatusEnum.APPROVED) {
        await tx
          .update(shopTable)
          .set({ status: ShopStatusEnum.ACTIVE })
          .where(eq(shopTable.id, shopId));
      }

      return verification;
    });
  }
}
