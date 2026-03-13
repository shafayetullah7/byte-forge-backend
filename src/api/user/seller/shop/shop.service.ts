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
import { UpdateShopDto } from './dto/update-shop.dto';
import { UpdateBrandingDto } from './dto/update-branding.dto';
import { UpdateShopContactDto } from './dto/update-shop-contact.dto';
import { UpdateShopSocialMediaDto } from './dto/update-shop-social-media.dto';
import { UpdateShopAddressDto } from './dto/update-shop-address.dto';
import { TNewShopTranslation } from '@/_db/drizzle/schema/shop';
import { resolveTranslation } from '@/common/utils/resolve-translation.util';

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

      const shopWithName =
        await this.shopRepository.findShopByNameInTranslations(
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

        // Mark media as used (increment count)
        await this.mediaRepository.incrementMediaUsage(mediaIds, tx);
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

  async getShopByUser(userId: string, lang: string): Promise<any | null> {
    const data = await this.shopRepository.getShopByOwnerWithRelations(userId);

    if (!data) return null;
    return this.mapToLocalizedShop(data, lang);
  }

  async updateMyShop(shopId: string, dto: UpdateShopDto, lang: string) {
    return this.db.transaction(async (tx) => {
      // 1. Fetch and Lock
      const shop = await this.shopRepository.getShopById(shopId, {
        tx,
        lock: true,
      });

      if (!shop) {
        throw new CustomException({
          message: this.i18n.t('message.error.shopNotFound', { lang }),
          statusCode: HttpStatus.NOT_FOUND,
          errorCode: ErrorCode.NOT_FOUND,
        });
      }

      // 2. Update address if provided
      if (dto.address) {
        await this.shopRepository.update(shop.id, { address: dto.address }, tx);
      }

      // 3. Upsert translations
      if (dto.translations && dto.translations.length > 0) {
        for (const translation of dto.translations) {
          const payload = {
            ...translation,
            shopId: shop.id,
          } as any as TNewShopTranslation;
          await this.shopRepository.upsertShopTranslation(payload, tx);
        }
      }

      const updatedShop =
        await this.shopRepository.getShopWithRelations(shopId);
      return this.mapToLocalizedShop(updatedShop!, lang);
    });
  }

  async updateMyBranding(shopId: string, dto: UpdateBrandingDto, lang: string) {
    return this.db.transaction(async (tx) => {
      // 1. Fetch and Lock
      const shop = await this.shopRepository.getShopById(shopId, {
        tx,
        lock: true,
      });

      if (!shop) {
        throw new CustomException({
          message: this.i18n.t('message.error.shopNotFound', { lang }),
          statusCode: HttpStatus.NOT_FOUND,
          errorCode: ErrorCode.NOT_FOUND,
        });
      }

      // 2. Media Ownership Validation
      const mediaIds: string[] = [];
      if (dto.logoId) mediaIds.push(dto.logoId);
      if (dto.bannerId) mediaIds.push(dto.bannerId);

      if (mediaIds.length > 0) {
        const medias = await this.mediaRepository.findMediaDetailsByIds(
          mediaIds,
          { tx, lock: true },
        );

        if (medias.find((m) => m.userUploadMedia.userId !== shop.ownerId)) {
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

        // Mark media as used (increment count)
        await this.mediaRepository.incrementMediaUsage(mediaIds, tx);
      }

      // 2b. Decrement old media if replaced
      const oldMediaIdsToDecrement: string[] = [];
      if (dto.logoId && shop.logoId && dto.logoId !== shop.logoId) {
        oldMediaIdsToDecrement.push(shop.logoId);
      }
      if (dto.bannerId && shop.bannerId && dto.bannerId !== shop.bannerId) {
        oldMediaIdsToDecrement.push(shop.bannerId);
      }
      if (oldMediaIdsToDecrement.length > 0) {
        await this.mediaRepository.decrementMediaUsage(
          oldMediaIdsToDecrement,
          tx,
        );
      }

      // 3. Update shop fields
      await this.shopRepository.update(
        shop.id,
        {
          logoId: dto.logoId,
          bannerId: dto.bannerId,
          primaryColor: dto.primaryColor,
          secondaryColor: dto.secondaryColor,
          accentColor: dto.accentColor,
        },
        tx,
      );

      const updatedShop =
        await this.shopRepository.getShopWithRelations(shopId);
      return this.mapToLocalizedShop(updatedShop!, lang);
    });
  }

  private async updateShopSection<T>(
    shopId: string,
    lang: string,
    updateFn: (tx: any) => Promise<void>,
  ) {
    return this.db.transaction(async (tx) => {
      // 1. Fetch and Lock
      const shop = await this.shopRepository.getShopById(shopId, {
        tx,
        lock: true,
      });

      if (!shop) {
        throw new CustomException({
          message: this.i18n.t('message.error.shopNotFound', { lang }),
          statusCode: HttpStatus.NOT_FOUND,
          errorCode: ErrorCode.NOT_FOUND,
        });
      }

      // 2. Perform the update
      await updateFn(tx);

      const updatedShop =
        await this.shopRepository.getShopWithRelations(shopId);
      return this.mapToLocalizedShop(updatedShop!, lang);
    });
  }

  async updateMyShopContact(
    shopId: string,
    dto: UpdateShopContactDto,
    lang: string,
  ) {
    return this.updateShopSection(shopId, lang, async (tx) => {
      await this.shopRepository.upsertShopContact(
        shopId,
        {
          ...(dto.businessEmail !== undefined && {
            businessEmail: dto.businessEmail,
          }),
          ...(dto.phone !== undefined && { phone: dto.phone }),
          ...(dto.alternativePhone !== undefined && {
            alternativePhone: dto.alternativePhone,
          }),
          ...(dto.whatsapp !== undefined && { whatsapp: dto.whatsapp }),
          ...(dto.telegram !== undefined && { telegram: dto.telegram }),
        },
        tx,
      );
    });
  }

  async updateMyShopSocialMedia(
    shopId: string,
    dto: UpdateShopSocialMediaDto,
    lang: string,
  ) {
    return this.updateShopSection(shopId, lang, async (tx) => {
      await this.shopRepository.upsertShopSocialMedia(
        shopId,
        {
          ...(dto.facebook !== undefined && { facebook: dto.facebook }),
          ...(dto.instagram !== undefined && { instagram: dto.instagram }),
          ...(dto.x !== undefined && { x: dto.x }),
        },
        tx,
      );
    });
  }

  async updateMyShopAddress(
    shopId: string,
    dto: UpdateShopAddressDto,
    lang: string,
  ) {
    return this.updateShopSection(shopId, lang, async (tx) => {
      await this.shopRepository.upsertShopAddress(
        shopId,
        {
          ...(dto.country !== undefined && { country: dto.country }),
          ...(dto.division !== undefined && { division: dto.division }),
          ...(dto.district !== undefined && { district: dto.district }),
          ...(dto.street !== undefined && { street: dto.street }),
          ...(dto.postalCode !== undefined && { postalCode: dto.postalCode }),
          ...(dto.latitude !== undefined && {
            // Ensure consistent precision for GPS coordinates (10 decimal places)
            latitude: dto.latitude.toFixed(10),
          }),
          ...(dto.longitude !== undefined && {
            // Ensure consistent precision for GPS coordinates (10 decimal places)
            longitude: dto.longitude.toFixed(10),
          }),
          ...(dto.googleMapsLink !== undefined && {
            googleMapsLink: dto.googleMapsLink,
          }),
        },
        tx,
      );
    });
  }

  mapToLocalizedShop(shop: any, lang: string) {
    const translation = resolveTranslation(shop.translations, lang) as any;
    return {
      ...shop,
      shopName: translation?.shopName ?? '',
      about: translation?.about ?? '',
      brandStory: translation?.brandStory ?? '',
      featuredHighlight: translation?.featuredHighlight ?? '',
    };
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
