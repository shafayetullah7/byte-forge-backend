import { HttpStatus, Injectable } from '@nestjs/common';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { ShopRepository } from '@/_repositories/business/shop.repository/shop.repository';
import { ApplySellerDto } from './dto/apply.seller.dto';
import {
  mediaTable,
  shopTable,
  TNewShop,
  TNewShopVerification,
  TShop,
} from '@/_db/drizzle/schema';
import { MediaRepository } from '@/_repositories/providers/media/media.repository/media.repository';
import { eq } from 'drizzle-orm';
import { I18nService } from 'nestjs-i18n';
import { CustomException } from '@/common/exceptions/custom.exception';
import { ErrorCode } from '@/common/modules/response/dto/error.schema';
import { ShopVerificationStatusEnum } from '@/_db/drizzle/enum';

type TShopWithLogo = TShop & {
  logo: { id: string; url: string } | null;
};

@Injectable()
export class ShopService {
  constructor(
    private readonly db: DrizzleService,
    private readonly shopRepository: ShopRepository,
    private readonly mediaRepository: MediaRepository,
    private readonly i18n: I18nService,
  ) {}

  async applyAsSeller(userId: string, payload: ApplySellerDto, lang: string) {
    return this.db.transaction(async (tx) => {
      // 1. Check if user already owns a shop
      const existingShop = await this.shopRepository.getShopByOwnerId(userId, {
        tx,
        lock: true,
      });

      if (existingShop) {
        throw new CustomException({
          message: this.i18n.t('message.error.shopAlreadyExists', { lang }),
          statusCode: HttpStatus.CONFLICT,
          errorCode: ErrorCode.DUPLICATE_ENTRY,
        });
      }

      // 2. Validate shop name uniqueness (English version for slug and global check)
      const englishTranslation = payload.translations.find(
        (t) => t.locale === 'en',
      );
      if (!englishTranslation) {
        throw new CustomException({
          message: this.i18n.t('message.error.englishTranslationRequired', {
            lang,
          }),
          statusCode: HttpStatus.BAD_REQUEST,
          errorCode: ErrorCode.VALIDATION_ERROR,
        });
      }

      const shopWithName = await this.shopRepository.findShopByNameInTranslations(
        englishTranslation.shopName,
        { tx, lock: true },
      );

      if (shopWithName) {
        throw new CustomException({
          message: this.i18n.t('message.error.shopNameTaken', { lang }),
          statusCode: HttpStatus.BAD_REQUEST,
          errorCode: ErrorCode.VALIDATION_ERROR,
        });
      }

      // 3. Media Validation
      const mediaIds: string[] = [];
      if (payload.logoId) mediaIds.push(payload.logoId);
      if (payload.bannerId) mediaIds.push(payload.bannerId);
      if (payload.tradeLicenseDocumentId)
        mediaIds.push(payload.tradeLicenseDocumentId);
      if (payload.tinDocumentId) mediaIds.push(payload.tinDocumentId);
      if (payload.utilityBillDocumentId)
        mediaIds.push(payload.utilityBillDocumentId);

      if (mediaIds.length > 0) {
        const medias = await this.mediaRepository.findMediaDetailsByIds(
          mediaIds,
          { tx, lock: true },
        );

        if (medias.find((m) => m.userUploadMedia.userId !== userId)) {
          throw new CustomException({
            message: this.i18n.t('message.error.mediaNotOwned', { lang }),
            statusCode: HttpStatus.FORBIDDEN,
            errorCode: ErrorCode.FORBIDDEN,
          });
        }

        if (!this.mediaRepository.verifyMediaExistence(mediaIds, medias)) {
          throw new CustomException({
            message: this.i18n.t('message.error.mediaNotFound', { lang }),
            statusCode: HttpStatus.NOT_FOUND,
            errorCode: ErrorCode.NOT_FOUND,
          });
        }

        // Mark media as used
        await this.mediaRepository.useMedia(mediaIds, tx);
      }

      // 4. Create Shop
      const slug = this.generateSlug(englishTranslation.shopName);
      const shopPayload: TNewShop = {
        ownerId: userId,
        slug,
        address: payload.address,
        logoId: payload.logoId,
        bannerId: payload.bannerId,
      };

      const shop = await this.shopRepository.createShop(shopPayload, tx);

      // 5. Create Translations
      const translationPayloads = payload.translations.map((t) => ({
        ...t,
        shopId: shop.id,
      }));
      await this.shopRepository.createShopTranslations(translationPayloads, tx);

      // 6. Create Verification Record
      const verificationPayload: TNewShopVerification = {
        shopId: shop.id,
        tradeLicenseNumber: payload.tradeLicenseNumber,
        tradeLicenseDocument: payload.tradeLicenseDocumentId,
        tinNumber: payload.tinNumber,
        tinDocument: payload.tinDocumentId,
        utilityBillDocument: payload.utilityBillDocumentId,
        status: ShopVerificationStatusEnum.PENDING,
      };

      await this.shopRepository.createShopVerification(verificationPayload, tx);

      return shop;
    });
  }

  async getShopByUser(userId: string): Promise<any | null> {
    const data = await this.db.client.query.shopTable.findFirst({
      where: eq(shopTable.ownerId, userId),
      with: {
        translations: true,
        logo: true,
      },
    });

    if (!data) return null;
    return data;
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
