import { HttpStatus, Injectable } from '@nestjs/common';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { ShopRepository } from '@/_repositories/business/shop.repository/shop.repository';
import { ShopVerificationRepository } from '@/_repositories/business/shop.verification.repository/shop.verification.repository';
import { ApplySellerDto } from './dto/apply.seller.dto';
import { TNewShop, TNewShopVerification } from '@/_db/drizzle/schema';
import { MediaRepository } from '@/_repositories/providers/media/media.repository/media.repository';
import { I18nService } from 'nestjs-i18n';
import { CustomException } from '@/common/exceptions/custom.exception';
import { ErrorCode } from '@/common/modules/response/dto/error.schema';
import { ShopVerificationStatusEnum } from '@/_db/drizzle/enum';
import { UpdateShopDto } from './dto/update-shop.dto';
import { UpdateBrandingDto } from './dto/update-branding.dto';
import { UpdateShopContactDto } from './dto/update-shop-contact.dto';
import { UpdateShopSocialMediaDto } from './dto/update-shop-social-media.dto';
import { UpdateShopAddressDto } from './dto/update-shop-address.dto';
import { UpdateVerificationDto } from './dto/update-verification.dto';
import { TNewShopTranslation } from '@/_db/drizzle/schema/shop';
import { shopContactTable } from '@/_db/drizzle/schema/shop/shop.contact.schema';
import { shopAddressTable } from '@/_db/drizzle/schema/shop/shop.address.schema';
import { resolveTranslation } from '@/common/utils/resolve-translation.util';
import {
  LocalizedShopDetails,
  ShopStatus,
  TShopWithBranding,
  VerificationStatus,
} from './shop.types';

@Injectable()
export class ShopService {
  constructor(
    private readonly db: DrizzleService,
    private readonly shopRepository: ShopRepository,
    private readonly shopVerificationRepository: ShopVerificationRepository,
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
          englishTranslation.name,
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
      // Use provided slug or generate from English shop name
      const slug = payload.slug || this.generateSlug(englishTranslation.name);

      // Validate slug uniqueness if provided
      if (payload.slug) {
        const existingShop = await this.shopRepository.findShopBySlug(slug, {
          tx,
          lock: false,
        });
        if (existingShop) {
          throw new CustomException({
            message: this.i18n.t('message.error.shopSlugTaken', { lang }),
            statusCode: HttpStatus.BAD_REQUEST,
            errorCode: ErrorCode.VALIDATION_ERROR,
          });
        }
      }

      const shopPayload: TNewShop = {
        ownerId: userId,
        slug,
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

      return shop;
    });
  }

  /**
   * Get localized shop details - returns shop info with translations, logo, and banner only
   * Used for public shop display and basic shop information
   */
  async getLocalizedShopDetails(
    userId: string,
    lang: string,
  ): Promise<LocalizedShopDetails | null> {
    const data = await this.shopRepository.getShopByOwnerBranding(userId);

    if (!data) return null;

    return this.mapToLocalizedShopDetails(data, lang);
  }

  /**
   * Get minimal shop status for routing decisions
   * Returns only essential fields to check if user has a shop setup
   */
  async getShopStatus(userId: string): Promise<ShopStatus | null> {
    const data = await this.shopRepository.getShopByOwnerMinimal(userId);

    if (!data) return null;

    return {
      id: data.id,
      slug: data.slug,
      status: data.status,
      hasTranslations: data.translations?.length > 0,
    };
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

      // 2. Upsert translations
      if (dto.translations && dto.translations.length > 0) {
        for (const translation of dto.translations) {
          const payload = {
            ...translation,
            shopId: shop.id,
          } as any as TNewShopTranslation;
          await this.shopRepository.upsertShopTranslation(payload, tx);
        }
      }

      const updatedShop = await this.shopRepository.getShopByOwnerBranding(
        shop.ownerId,
      );
      return this.mapToLocalizedShopDetails(updatedShop!, lang);
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

      const updatedShop = await this.shopRepository.getShopByOwnerBranding(
        shop.ownerId,
      );
      return this.mapToLocalizedShopDetails(updatedShop!, lang);
    });
  }

  private async updateShopSection(
    shopId: string,
    lang: string,
    updateFn: (tx: any, shop: { ownerId: string }) => Promise<void>,
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
      await updateFn(tx, shop);

      const updatedShop = await this.shopRepository.getShopByOwnerBranding(
        shop.ownerId,
      );
      return this.mapToLocalizedShopDetails(updatedShop!, lang);
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
      await this.shopRepository.upsertShopContact(
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
      // 1. Upsert main address
      const address = await this.shopRepository.upsertShopAddress(
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

      // 2. Upsert address translations if provided (for 'bn' locale)
      if (dto.translations) {
        await this.shopRepository.upsertShopAddressTranslation(
          address.id,
          {
            ...(dto.translations.country !== undefined && {
              country: dto.translations.country,
            }),
            ...(dto.translations.division !== undefined && {
              division: dto.translations.division,
            }),
            ...(dto.translations.district !== undefined && {
              district: dto.translations.district,
            }),
            ...(dto.translations.street !== undefined && {
              street: dto.translations.street,
            }),
          },
          'bn', // Always saving translations for Bengali
          tx,
        );
      }
    });
  }

  /**
   * Maps shop branding data to include localized content based on requested language
   * Returns simplified shop details with only translations, logo, and banner
   */
  private mapToLocalizedShopDetails(
    shop: TShopWithBranding & {
      shopContactTable?: typeof shopContactTable.$inferSelect | null;
      shopAddressTable?: typeof shopAddressTable.$inferSelect | null;
    },
    lang: string,
  ): LocalizedShopDetails {
    const translation = resolveTranslation(shop.translations, lang) as {
      name: string;
      description: string | null;
      businessHours: string | null;
    } | null;

    return {
      id: shop.id,
      ownerId: shop.ownerId,
      slug: shop.slug,
      logoId: shop.logoId,
      bannerId: shop.bannerId,
      status: shop.status,
      createdAt: shop.createdAt,
      updatedAt: shop.updatedAt,
      name: translation?.name ?? '',
      description: translation?.description ?? null,
      businessHours: translation?.businessHours ?? null,
      logo: shop.logo
        ? {
            id: shop.logo.id,
            url: shop.logo.url,
            mimeType: shop.logo.mimeType,
            fileName: shop.logo.fileName,
            size: shop.logo.size,
          }
        : null,
      banner: shop.banner
        ? {
            id: shop.banner.id,
            url: shop.banner.url,
            mimeType: shop.banner.mimeType,
            fileName: shop.banner.fileName,
            size: shop.banner.size,
          }
        : null,
      translations: shop.translations,
      contact: shop.shopContactTable
        ? {
            businessEmail: shop.shopContactTable.businessEmail,
            phone: shop.shopContactTable.phone,
            alternativePhone: shop.shopContactTable.alternativePhone,
            whatsapp: shop.shopContactTable.whatsapp,
            telegram: shop.shopContactTable.telegram,
            facebook: shop.shopContactTable.facebook,
            instagram: shop.shopContactTable.instagram,
            x: shop.shopContactTable.x,
          }
        : null,
      address: shop.shopAddressTable
        ? {
            country: shop.shopAddressTable.country,
            division: shop.shopAddressTable.division,
            district: shop.shopAddressTable.district,
            street: shop.shopAddressTable.street,
            postalCode: shop.shopAddressTable.postalCode,
            latitude: shop.shopAddressTable.latitude,
            longitude: shop.shopAddressTable.longitude,
            googleMapsLink: shop.shopAddressTable.googleMapsLink,
            isVerified: shop.shopAddressTable.isVerified,
          }
        : null,
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

  /**
   * Get verification status for a user's shop
   */
  async getVerificationStatus(
    userId: string,
  ): Promise<VerificationStatus | null> {
    const shop = await this.shopRepository.getShopByOwnerId(userId);

    if (!shop) {
      return null;
    }

    const verification = await this.shopVerificationRepository.findOne({
      shopId: shop.id,
    });

    if (!verification) {
      return null;
    }

    return {
      id: verification.id,
      shopId: verification.shopId,
      status: verification.status,
      tradeLicenseNumber: verification.tradeLicenseNumber,
      tinNumber: verification.tinNumber,
      rejectionReason: verification.rejectionReason,
      verifiedAt: verification.verifiedAt,
      createdAt: verification.createdAt,
      updatedAt: verification.updatedAt,
    };
  }

  /**
   * Update verification documents for a shop
   */
  async updateVerificationDocuments(
    shopId: string,
    dto: UpdateVerificationDto,
    lang: string,
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

      // 2. Validate media ownership if documents are provided
      const mediaIds: string[] = [];
      if (dto.tradeLicenseDocumentId) mediaIds.push(dto.tradeLicenseDocumentId);
      if (dto.tinDocumentId) mediaIds.push(dto.tinDocumentId);
      if (dto.utilityBillDocumentId) mediaIds.push(dto.utilityBillDocumentId);

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

      // 3. Get existing verification record
      const existingVerification =
        await this.shopVerificationRepository.findOne({ shopId });

      if (!existingVerification) {
        throw new CustomException({
          message: this.i18n.t('message.error.verificationNotFound', { lang }),
          statusCode: HttpStatus.NOT_FOUND,
          errorCode: ErrorCode.NOT_FOUND,
        });
      }

      // 4. Update verification record
      const updatePayload: Partial<TNewShopVerification> = {};

      if (dto.tradeLicenseNumber !== undefined) {
        updatePayload.tradeLicenseNumber = dto.tradeLicenseNumber;
      }
      if (dto.tradeLicenseDocumentId !== undefined) {
        updatePayload.tradeLicenseDocument = dto.tradeLicenseDocumentId;
      }
      if (dto.tinNumber !== undefined) {
        updatePayload.tinNumber = dto.tinNumber;
      }
      if (dto.tinDocumentId !== undefined) {
        updatePayload.tinDocument = dto.tinDocumentId;
      }
      if (dto.utilityBillDocumentId !== undefined) {
        updatePayload.utilityBillDocument = dto.utilityBillDocumentId;
      }

      // Reset status to PENDING if any document is updated
      if (
        dto.tradeLicenseDocumentId ||
        dto.tinDocumentId ||
        dto.utilityBillDocumentId
      ) {
        updatePayload.status = ShopVerificationStatusEnum.PENDING;
        updatePayload.rejectionReason = null;
      }

      await this.shopVerificationRepository.update(
        updatePayload,
        { shopId },
        tx,
      );

      // 5. Return updated verification status
      return this.getVerificationStatus(shop.ownerId);
    });
  }

  async submitForReview(shopId: string, dto: UpdateShopDto, lang: string) {
    // Update shop with major changes
    // Note: This is a simplified implementation
    // Full implementation would update translations and log to history
    console.log('Submit for review:', shopId, dto);
  }

  async uploadImages(
    shopId: string,
    files: { logo?: Express.Multer.File; banner?: Express.Multer.File },
  ) {
    const result: { logoId?: string; bannerId?: string } = {};
    // Placeholder for image upload logic
    return result;
  }

  async deleteShop(shopId: string, lang: string) {
    // Placeholder - full implementation needs orders module
    console.log('Delete shop:', shopId);
  }

  async getVerificationHistory(shopId: string, lang: string) {
    // Placeholder - returns empty array for now
    return [];
  }
}
