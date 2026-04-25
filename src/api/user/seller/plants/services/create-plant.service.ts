import { Injectable, HttpStatus } from '@nestjs/common';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { DrizzleTx } from '@/_db/drizzle/types';
import { MediaRepository } from '@/_repositories/providers/media/media.repository/media.repository';
import { CategoryRepository } from '@/_repositories/library/taxonomy/category.repository';
import { TagRepository } from '@/_repositories/library/taxonomy/tag.repository';
import { ShopRepository } from '@/_repositories/business/shop.repository/shop.repository';
import { I18nService } from 'nestjs-i18n';
import { CustomException } from '@/common/exceptions/custom.exception';
import { ErrorCode } from '@/common/modules/response/dto/error.schema';
import { CreatePlantDto } from '../dto/create-plant.dto';
import { TLockTransaction } from '@/_repositories/_types/lock.transaction';
import { ShopStatusEnum, ProductStatusEnum } from '@/_db/drizzle/enum';
import {
  productsTable,
  productTranslationsTable,
  plantDetailsTable,
  plantDetailsTranslationsTable,
  plantCareInstructionsTable,
  plantCareTranslationsTable,
  productVariantsTable,
  plantVariantAttributesTable,
  productMediaTable,
  productTagsTable,
  TNewProduct,
  TNewProductTranslation,
  TNewPlantDetails,
  TNewPlantDetailsTranslation,
  TNewPlantCareInstructions,
  TNewPlantCareTranslation,
  TNewProductVariant,
  TNewPlantVariantAttributes,
  TNewProductMedia,
} from '@/_db/drizzle/schema';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class CreatePlantService {
  constructor(
    private readonly db: DrizzleService,
    private readonly mediaRepository: MediaRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly tagRepository: TagRepository,
    private readonly shopRepository: ShopRepository,
    private readonly i18n: I18nService,
  ) {}

  async execute(userId: string, dto: CreatePlantDto, lang: string) {
    return this.db.transaction(async (tx) => {
      // === 1. Get and validate shop ===
      const shop = await this.getShopByUserId(userId, tx, lang);

      // === 2. Validate category ===
      await this.validateCategory(dto.categoryId, tx, lang);

      // === 3. Validate tags ===
      if (dto.tagIds && dto.tagIds.length > 0) {
        await this.validateTags(dto.tagIds, tx, lang);
      }

      // === 4. Validate slug uniqueness ===
      await this.validateSlug(dto.slug, shop.id, tx, lang);

      // === 5. Validate media duplicates FIRST (fail fast) ===
      this.validateMediaDuplicates(dto);

      // === 6. Collect and validate ALL media IDs ===
      const allMediaIds = this.collectAllMediaIds(dto);
      await this.validateMediaOwnership(allMediaIds, userId, tx, lang);

      // === 5b. Validate variant SKUs ===
      this.validateVariantSkus(dto.variants);

      // === 5c. Validate slug exists or generate unique one ===
      const slug = dto.slug || await this.generateUniqueSlug(dto.translations.find((t) => t.locale === 'en')?.name || 'plant', shop.id, tx);

      // === 6. Create product ===
      const product = await this.createProductRecord(
        {
          shopId: shop.id,
          productType: 'plant',
          categoryId: dto.categoryId,
          slug,
          thumbnailId: dto.thumbnailId,
          status: (dto.status || ProductStatusEnum.DRAFT) as any,
        },
        tx,
      );

      // === 7. Create product translations (BATCH) ===
      if (dto.translations && dto.translations.length > 0) {
        await this.createProductTranslations(product.id, dto.translations, tx);
      }

      // === 8. Create plant details (EN + Shared) ===
      await this.createPlantDetails(
        product.id,
        dto.plantDetails,
        dto.enDetails,
        tx,
      );

      // === 9. Create plant details translations (BN) ===
      await this.createPlantDetailsTranslations(
        product.id,
        dto.bnDetails,
        tx,
      );

      // === 9. Create care instructions ===
      if (dto.careInstructions) {
        await this.createCareInstructions(product.id, dto.careInstructions, tx);

        if (dto.careTranslations && dto.careTranslations.length > 0) {
          await this.createCareTranslations(product.id, dto.careTranslations, tx);
        }
      }

      // === 10. Create variants (BATCH) ===
      const variants = await this.createVariants(product.id, dto.variants, tx);

      // === 11. Create product media (BATCH - single insert) ===
      await this.createProductMedia(product.id, variants, dto, tx);

      // === 12. Create product tags (BATCH) ===
      if (dto.tagIds && dto.tagIds.length > 0) {
        await this.createProductTags(product.id, dto.tagIds, tx);
      }

      // === 13. Increment media usage counts (BATCH - single update) ===
      await this.mediaRepository.incrementMediaUsage(allMediaIds, tx);

      // === 14. Increment category usage count ===
      await this.categoryRepository.incrementUsageCount(dto.categoryId, 1, tx);

      // === 15. Increment tag usage counts (BATCH) ===
      if (dto.tagIds && dto.tagIds.length > 0) {
        await this.tagRepository.incrementUsageCountBatch(dto.tagIds, 1, tx);
      }

      // === 16. Return product ID (controller can fetch complete data if needed) ===
      return { id: product.id };
    });
  }

  // === Validation Methods ===

  private async getShopByUserId(
    userId: string,
    tx: DrizzleTx,
    lang: string,
  ) {
    const transaction: TLockTransaction = { tx, lock: true };
    const shop = await this.shopRepository.getShopByOwnerId(userId, transaction);

    if (!shop) {
      throw new CustomException({
        message: this.i18n.t('message.error.shopNotFound', { lang }),
        statusCode: HttpStatus.NOT_FOUND,
        errorCode: ErrorCode.NOT_FOUND,
      });
    }

    // Check shop status - only ACTIVE or PENDING_VERIFICATION shops can create plants
    if (shop.status !== ShopStatusEnum.ACTIVE && shop.status !== ShopStatusEnum.PENDING_VERIFICATION) {
      throw new CustomException({
        message: this.i18n.t('message.error.shopNotActive', { lang }),
        statusCode: HttpStatus.FORBIDDEN,
        errorCode: ErrorCode.FORBIDDEN,
      });
    }

    return shop;
  }

  private async validateCategory(categoryId: string, tx: DrizzleTx, lang: string) {
    const category = await this.categoryRepository.findOne(categoryId);

    if (!category) {
      throw new CustomException({
        message: this.i18n.t('message.error.invalidCategory', { lang }),
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.VALIDATION_ERROR,
      });
    }

    if (!category.isActive) {
      throw new CustomException({
        message: this.i18n.t('message.error.categoryInactive', { lang }),
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.VALIDATION_ERROR,
      });
    }
  }

  private async validateTags(tagIds: string[], tx: DrizzleTx, lang: string) {
    const tags = await this.tagRepository.findByIds(tagIds, { tx, lock: true });

    if (tags.length !== tagIds.length) {
      const foundIds = new Set(tags.map((t) => t.id));
      const invalidIds = tagIds.filter((id) => !foundIds.has(id));
      throw new CustomException({
        message: this.i18n.t('message.error.invalidTags', { lang }),
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.VALIDATION_ERROR,
        validationErrors: invalidIds.map((id) => ({
          field: 'tagIds',
          message: `Tag ${id} does not exist`,
        })),
      });
    }

    const inactiveTags = tags.filter((t) => !t.isActive);
    if (inactiveTags.length > 0) {
      throw new CustomException({
        message: this.i18n.t('message.error.inactiveTags', { lang }),
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.VALIDATION_ERROR,
      });
    }
  }

  private async validateSlug(
    slug: string | undefined,
    shopId: string,
    tx: DrizzleTx,
    lang: string,
  ) {
    if (!slug) return;

    const existing = await tx.query.productsTable.findFirst({
      where: and(
        eq(productsTable.slug, slug),
        eq(productsTable.shopId, shopId),
      ),
    });

    if (existing) {
      throw new CustomException({
        message: this.i18n.t('message.error.slugTaken', { lang }),
        statusCode: HttpStatus.CONFLICT,
        errorCode: ErrorCode.DUPLICATE_ENTRY,
      });
    }
  }

  private validateVariantSkus(variants: any[]) {
    const skus = variants.map((v) => v.sku).filter(Boolean);
    const uniqueSkus = new Set(skus);

    if (skus.length !== uniqueSkus.size) {
      throw new CustomException({
        message: 'Duplicate SKU in variants',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.VALIDATION_ERROR,
        validationErrors: [
          {
            field: 'variants.sku',
            message: 'Each variant must have a unique SKU',
          },
        ],
      });
    }
  }

  private validateMediaDuplicates(dto: CreatePlantDto) {
    const allMediaIds = [dto.thumbnailId];
    dto.variants.forEach((v) => {
      if (v.mediaIds) allMediaIds.push(...v.mediaIds);
    });

    const uniqueMediaIds = new Set(allMediaIds);
    if (allMediaIds.length !== uniqueMediaIds.size) {
      throw new CustomException({
        message: 'Duplicate media IDs',
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.VALIDATION_ERROR,
        validationErrors: [
          {
            field: 'mediaIds',
            message: 'Same media cannot be used multiple times',
          },
        ],
      });
    }
  }

  private collectAllMediaIds(dto: CreatePlantDto): string[] {
    const mediaIds = [dto.thumbnailId];

    dto.variants.forEach((variant) => {
      if (variant.mediaIds && variant.mediaIds.length > 0) {
        mediaIds.push(...variant.mediaIds);
      }
    });

    return mediaIds.filter(Boolean);
  }

  private async validateMediaOwnership(
    mediaIds: string[],
    userId: string,
    tx: DrizzleTx,
    lang: string,
  ) {
    if (mediaIds.length === 0) return;

    const existenceCheck = await this.mediaRepository.checkMediaExistence(
      mediaIds,
      tx,
    );
    if (!existenceCheck.valid) {
      throw new CustomException({
        message: this.i18n.t('message.error.mediaNotFound', { lang }),
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.VALIDATION_ERROR,
        validationErrors: existenceCheck.invalidIds.map((id) => ({
          field: 'mediaIds',
          message: `Media ${id} does not exist`,
        })),
      });
    }

    const isOwner = await this.mediaRepository.verifyMediaOwnership(
      mediaIds,
      userId,
      tx,
    );
    if (!isOwner) {
      throw new CustomException({
        message: this.i18n.t('message.error.mediaNotOwned', { lang }),
        statusCode: HttpStatus.FORBIDDEN,
        errorCode: ErrorCode.FORBIDDEN,
      });
    }
  }

  private async generateUniqueSlug(
    baseName: string,
    shopId: string,
    tx: DrizzleTx,
  ): Promise<string> {
    let slug = this.generateSlug(baseName);
    let counter = 1;
    let originalSlug = slug;

    while (true) {
      const existing = await tx.query.productsTable.findFirst({
        where: and(
          eq(productsTable.slug, slug),
          eq(productsTable.shopId, shopId),
        ),
      });

      if (!existing) {
        return slug;
      }

      // Slug exists, try with counter
      counter++;
      slug = `${originalSlug}-${counter}`;

      // Prevent infinite loop
      if (counter > 1000) {
        throw new CustomException({
          message: 'Unable to generate unique slug',
          statusCode: HttpStatus.BAD_REQUEST,
          errorCode: ErrorCode.VALIDATION_ERROR,
        });
      }
    }
  }

  // === Creation Methods (BATCH Operations) ===

  private async createProductRecord(
    payload: TNewProduct,
    tx: DrizzleTx,
  ) {
    const [product] = await tx
      .insert(productsTable)
      .values(payload)
      .returning();
    return product;
  }

  private async createProductTranslations(
    productId: string,
    translations: Array<{
      locale: string;
      name: string;
      description: string;
      shortDescription?: string;
    }>,
    tx: DrizzleTx,
  ) {
    const payloads: TNewProductTranslation[] = translations.map((t) => ({
      productId,
      locale: t.locale,
      name: t.name,
      description: t.description,
      shortDescription: t.shortDescription || null,
    }));

    await tx.insert(productTranslationsTable).values(payloads);
  }

  private async createPlantDetails(
    productId: string,
    details: any,
    enDetails: any,
    tx: DrizzleTx,
  ) {
    const payload: TNewPlantDetails = {
      productId,
      scientificName: details.scientificName || null,
      commonNames: enDetails.commonNames || null,
      origin: enDetails.origin || null,
      lightRequirement: details.lightRequirement || null,
      wateringFrequency: details.wateringFrequency || null,
      humidityLevel: details.humidityLevel || null,
      temperatureRange: details.temperatureRange || null,
      soilType: enDetails.soilType || null,
      careDifficulty: details.careDifficulty || null,
      growthRate: details.growthRate || null,
      matureHeight: details.matureHeight || null,
      matureSpread: details.matureSpread || null,
      toxicityInfo: enDetails.toxicityInfo || null,
    };

    await tx.insert(plantDetailsTable).values(payload);
  }

  private async createPlantDetailsTranslations(
    productId: string,
    bnDetails: any,
    tx: DrizzleTx,
  ) {
    const payload: TNewPlantDetailsTranslation = {
      plantId: productId,
      locale: 'bn',
      commonNames: bnDetails.commonNames || null,
      origin: bnDetails.origin || null,
      soilType: bnDetails.soilType || null,
      toxicityInfo: bnDetails.toxicityInfo || null,
    };

    await tx.insert(plantDetailsTranslationsTable).values(payload);
  }

  private async createCareInstructions(
    productId: string,
    instructions: any,
    tx: DrizzleTx,
  ) {
    const payload: TNewPlantCareInstructions = {
      productId,
      lightInstructions: instructions.lightInstructions || null,
      wateringInstructions: instructions.wateringInstructions || null,
      humidityInstructions: instructions.humidityInstructions || null,
      fertilizerSchedule: instructions.fertilizerSchedule || null,
      repottingFrequency: instructions.repottingFrequency || null,
      pruningNotes: instructions.pruningNotes || null,
      commonProblems: instructions.commonProblems || null,
      seasonalCare: instructions.seasonalCare || null,
    };

    await tx.insert(plantCareInstructionsTable).values(payload);
  }

  private async createCareTranslations(
    productId: string,
    translations: Array<{
      locale: string;
      lightInstructions?: string;
      wateringInstructions?: string;
      humidityInstructions?: string;
      fertilizerSchedule?: string;
      repottingFrequency?: string;
      pruningNotes?: string;
      commonProblems?: string;
      seasonalCare?: string;
    }>,
    tx: DrizzleTx,
  ) {
    const payloads: TNewPlantCareTranslation[] = translations.map((t) => ({
      careId: productId,
      locale: t.locale,
      lightInstructions: t.lightInstructions || null,
      wateringInstructions: t.wateringInstructions || null,
      humidityInstructions: t.humidityInstructions || null,
      fertilizerSchedule: t.fertilizerSchedule || null,
      repottingFrequency: t.repottingFrequency || null,
      pruningNotes: t.pruningNotes || null,
      commonProblems: t.commonProblems || null,
      seasonalCare: t.seasonalCare || null,
    }));

    await tx.insert(plantCareTranslationsTable).values(payloads);
  }

  private async createVariants(
    productId: string,
    variants: any[],
    tx: DrizzleTx,
  ) {
    const variantPayloads: TNewProductVariant[] = variants.map((v, index) => ({
      productId,
      sku: v.sku || null,
      price: v.price.toString(),
      salePrice: v.salePrice ? v.salePrice.toString() : null,
      costPrice: v.costPrice ? v.costPrice.toString() : null,
      inventoryCount: v.inventoryCount ?? 0,
      trackInventory: v.trackInventory ?? true,
      lowStockThreshold: v.lowStockThreshold ?? 5,
      displayOrder: index,
      isBase: v.isBase ?? false,
      isActive: v.isActive ?? true,
    }));

    const createdVariants = await tx
      .insert(productVariantsTable)
      .values(variantPayloads)
      .returning();

    // Collect all attribute payloads first, then batch insert
    const attrPayloads: TNewPlantVariantAttributes[] = [];

    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      const createdVariant = createdVariants[i];

      if (variant.plantAttributes) {
        attrPayloads.push({
          variantId: createdVariant.id,
          potSize: variant.plantAttributes.potSize || null,
          potSizeInches: variant.plantAttributes.potSizeInches
            ? variant.plantAttributes.potSizeInches.toString()
            : null,
          potMaterial: variant.plantAttributes.potMaterial || null,
          potColorEn: variant.plantAttributes.potColor || null,
          potType: variant.plantAttributes.potType || null,
          growthStage: variant.plantAttributes.growthStage || null,
          plantForm: variant.plantAttributes.plantForm || null,
          variegation: variant.plantAttributes.variegation || null,
          propagationType: variant.plantAttributes.propagationType || null,
          containerType: variant.plantAttributes.containerType || null,
          bundleType: variant.plantAttributes.bundleType || null,
        });
      }
    }

    // Single batch insert for all variant attributes
    if (attrPayloads.length > 0) {
      await tx.insert(plantVariantAttributesTable).values(attrPayloads);
    }

    return createdVariants;
  }

  private async createProductMedia(
    productId: string,
    variants: any[],
    dto: CreatePlantDto,
    tx: DrizzleTx,
  ) {
    const mediaPayloads: TNewProductMedia[] = [];

    mediaPayloads.push({
      productId,
      variantId: null,
      mediaId: dto.thumbnailId,
      displayOrder: -1,
      isPrimary: true,
      type: 'image',
    });

    variants.forEach((variant, variantIndex) => {
      const variantDto = dto.variants[variantIndex];
      if (variantDto.mediaIds && variantDto.mediaIds.length > 0) {
        variantDto.mediaIds.forEach((mediaId: string, mediaIndex: number) => {
          mediaPayloads.push({
            productId,
            variantId: variant.id,
            mediaId,
            displayOrder: mediaIndex,
            isPrimary: mediaIndex === 0,
            type: 'image',
          });
        });
      }
    });

    if (mediaPayloads.length > 0) {
      await tx.insert(productMediaTable).values(mediaPayloads);
    }
  }

  private async createProductTags(
    productId: string,
    tagIds: string[],
    tx: DrizzleTx,
  ) {
    const payloads = tagIds.map((tagId) => ({
      productId,
      tagId,
    }));

    await tx.insert(productTagsTable).values(payloads);
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
