import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { ShopRepository } from '@/_repositories/business/shop.repository';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SetupShopDto } from './dto/setup.shop.dto';
import { BusinessAccountRepository } from '@/_repositories/business/business.account.repository';
import { TNewShop } from '@/_db/drizzle/schema';
import { MediaRepository } from '@/_repositories/providers/media/media.repository';

@Injectable()
export class ShopService {
  constructor(
    private readonly db: DrizzleService,
    private readonly businessAccountRepository: BusinessAccountRepository,
    private readonly shopRepository: ShopRepository,
    private readonly mediaRepository: MediaRepository,
  ) {}

  async createShop(userId: string, payload: SetupShopDto) {
    const businessAccount =
      await this.businessAccountRepository.findBusinessAccountByOwnerId(userId);

    if (!businessAccount) {
      throw new Error(
        'Business account not found. Please setup your business account first.',
      );
    }

    const mediaIds: string[] = [];
    if (payload.logo) {
      mediaIds.push(payload.logo);
    }
    if (payload.banner) {
      mediaIds.push(payload.banner);
    }

    const shopPayload: TNewShop = {
      ...payload,
      ownerId: userId,
      businessAccountId: businessAccount.id,
      establishDate: payload.establishDate?.toISOString(),
    };

    const medias = await this.mediaRepository.findMediaDetailsByIds(mediaIds);

    if (medias.find((media) => media.userUploadMedia.userId !== userId)) {
      throw new BadRequestException('Media not owned by user');
    }
    if (this.mediaRepository.verifyMediaExistence(mediaIds, medias)) {
      throw new NotFoundException('Media not found');
    }
    if (this.mediaRepository.areMediaUsed(medias.map((media) => media.media))) {
      throw new BadRequestException('Media already used');
    }

    const shop = await this.shopRepository.createShop(shopPayload);
    return shop;
  }
}
