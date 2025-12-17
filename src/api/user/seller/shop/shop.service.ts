import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { ShopRepository } from '@/_repositories/business/shop.repository/shop.repository';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SetupShopDto } from './dto/setup.shop.dto';
import { BusinessAccountRepository } from '@/_repositories/business/business.account.repository/business.account.repository';
import { TNewShop } from '@/_db/drizzle/schema';
import { MediaRepository } from '@/_repositories/providers/media/media.repository/media.repository';

@Injectable()
export class ShopService {
  constructor(
    private readonly db: DrizzleService,
    private readonly businessAccountRepository: BusinessAccountRepository,
    private readonly shopRepository: ShopRepository,
    private readonly mediaRepository: MediaRepository,
  ) {}

  async createShop(userId: string, payload: SetupShopDto) {
    return this.db.transaction(async (tx) => {
      const businessAccount =
        await this.businessAccountRepository.findBusinessAccountByOwnerId(
          userId,
        );

      if (!businessAccount) {
        throw new BadRequestException(
          'Business account not found. Please setup your business account first.',
        );
      }

      // Check for duplicate shop name for this user
      const existingShop = await this.shopRepository.findShopByName(
        userId,
        payload.shopName,
        { tx, lock: true },
      );

      if (existingShop) {
        throw new BadRequestException(
          'You already have a shop with this name. Please choose a different name.',
        );
      }

      const mediaIds: string[] = [];
      if (payload.logoId) {
        mediaIds.push(payload.logoId);
      }
      if (payload.bannerId) {
        mediaIds.push(payload.bannerId);
      }

      if (mediaIds.length > 0) {
        // Lock media for update to prevent race conditions
        const medias = await this.mediaRepository.findMediaDetailsByIds(
          mediaIds,
          {
            tx,
            lock: true,
          },
        );

        if (medias.find((media) => media.userUploadMedia.userId !== userId)) {
          throw new BadRequestException('Media not owned by user');
        }

        if (!this.mediaRepository.verifyMediaExistence(mediaIds, medias)) {
          throw new NotFoundException('Some media not found');
        }

        if (
          this.mediaRepository.areMediaUsed(medias.map((media) => media.media))
        ) {
          throw new BadRequestException('Some media already used');
        }

        // Mark media as used
        await this.mediaRepository.useMedia(mediaIds, tx);
      }

      const shopPayload: TNewShop = {
        ...payload,
        ownerId: userId,
        businessAccountId: businessAccount.id,
        establishDate: payload.establishDate,
      };

      const shop = await this.shopRepository.createShop(shopPayload, tx);
      return shop;
    });
  }

  async getShopsByUser(userId: string) {
    return this.shopRepository.getShopsByOwnerId(userId);
  }
}
