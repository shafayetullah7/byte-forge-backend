import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { productsTable } from '@/_db/drizzle/schema';

type Product = typeof productsTable.$inferSelect;
type ProductTranslation = typeof import('@/_db/drizzle/schema').productTranslationsTable.$inferSelect;
type PlantDetails = typeof import('@/_db/drizzle/schema').plantDetailsTable.$inferSelect;
type PlantDetailsTranslation = typeof import('@/_db/drizzle/schema').plantDetailsTranslationsTable.$inferSelect;
type PlantCareInstructions = typeof import('@/_db/drizzle/schema').plantCareInstructionsTable.$inferSelect;
type PlantCareTranslation = typeof import('@/_db/drizzle/schema').plantCareTranslationsTable.$inferSelect;
type ProductVariant = typeof import('@/_db/drizzle/schema').productVariantsTable.$inferSelect;
type PlantVariantAttributes = typeof import('@/_db/drizzle/schema').plantVariantAttributesTable.$inferSelect;
type ProductMedia = typeof import('@/_db/drizzle/schema').productMediaTable.$inferSelect;

export type PlantDetailResult = {
  id: string;
  slug: string;
  status: string;
  thumbnail: { id: string; url: string } | null;
  translations: Array<{
    locale: string;
    name: string;
    description: string | null;
    shortDescription: string | null;
  }>;
  plantDetails: {
    id: string;
    categoryId: string | null;
    scientificName: string | null;
    commonNames: string | null;
    origin: string | null;
    lightRequirement: string | null;
    wateringFrequency: string | null;
    humidityLevel: string | null;
    temperatureRange: string | null;
    soilType: string | null;
    careDifficulty: string | null;
    growthRate: string | null;
    matureHeight: string | null;
    matureSpread: string | null;
    toxicityInfo: string | null;
    category: {
      id: string;
      slug: string;
      translations: Array<{ locale: string; name: string }>;
    } | null;
    tags: Array<{
      id: string;
      slug: string;
      translations: Array<{ locale: string; name: string }>;
    }>;
    translations: Array<{
      locale: string;
      commonNames: string | null;
      origin: string | null;
      soilType: string | null;
      toxicityInfo: string | null;
    }>;
  } | null;
  careInstructions: {
    id: string;
    lightInstructions: string | null;
    wateringInstructions: string | null;
    humidityInstructions: string | null;
    fertilizerSchedule: string | null;
    repottingFrequency: string | null;
    pruningNotes: string | null;
    commonProblems: string | null;
    seasonalCare: string | null;
    translations: Array<{
      locale: string;
      lightInstructions: string | null;
      wateringInstructions: string | null;
      humidityInstructions: string | null;
      fertilizerSchedule: string | null;
      repottingFrequency: string | null;
      pruningNotes: string | null;
      commonProblems: string | null;
      seasonalCare: string | null;
    }>;
  } | null;
  variants: Array<{
    id: string;
    sku: string | null;
    price: string;
    inventoryCount: number;
    trackInventory: boolean;
    lowStockThreshold: number;
    displayOrder: number;
    isBase: boolean;
    isActive: boolean;
    plantAttributes: {
      id: string;
      growthStage: string;
      plantForm: string;
      variegation: string;
      leafDensity: string;
      stemCount: number;
      currentHeight: string | null;
      currentSpread: string | null;
      propagationType: string;
      containerType: string;
      containerSize: string | null;
      bundleType: string | null;
    } | null;
    media: Array<{
      id: string;
      mediaId: string;
      displayOrder: number;
      type: string;
      isPrimary: boolean;
      url: string;
    }>;
  }>;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class GetPlantByIdService {
  constructor(private readonly db: DrizzleService) {}

  async execute(shopId: string, plantId: string): Promise<PlantDetailResult | null> {
    const product = await this.db.client.query.productsTable.findFirst({
      where: eq(productsTable.id, plantId),
      with: {
        thumbnail: {
          columns: { id: true, url: true },
        },
        translations: {
          columns: { locale: true, name: true, description: true, shortDescription: true },
        },
        plantDetails: {
          with: {
            category: {
              columns: { id: true, slug: true },
              with: {
                translations: {
                  columns: { locale: true, name: true },
                },
              },
            },
            tags: {
              with: {
                tag: {
                  columns: { id: true, slug: true },
                  with: {
                    translations: {
                      columns: { locale: true, name: true },
                    },
                  },
                },
              },
            },
            translations: {
              columns: {
                locale: true,
                commonNames: true,
                origin: true,
                soilType: true,
                toxicityInfo: true,
              },
            },
          },
        },
        careInstructions: {
          with: {
            translations: {
              columns: {
                locale: true,
                lightInstructions: true,
                wateringInstructions: true,
                humidityInstructions: true,
                fertilizerSchedule: true,
                repottingFrequency: true,
                pruningNotes: true,
                commonProblems: true,
                seasonalCare: true,
              },
            },
          },
        },
        variants: {
          with: {
            plantAttributes: true,
            media: {
              with: {
                media: {
                  columns: { id: true, url: true },
                },
              },
            },
          },
        },
      },
    });

    if (!product) {
      return null;
    }

    if (product.shopId !== shopId) {
      return null;
    }

    return this.mapResult(product);
  }

  private mapResult(product: any): PlantDetailResult {
    const thumbnail = product.thumbnail
      ? { id: product.thumbnail.id, url: product.thumbnail.url }
      : null;

    const translations = product.translations.map((t) => ({
      locale: t.locale,
      name: t.name,
      description: t.description ?? null,
      shortDescription: t.shortDescription ?? null,
    }));

    const plantDetails = product.plantDetails
      ? this.mapPlantDetails(product.plantDetails)
      : null;

    const careInstructions = product.careInstructions
      ? this.mapCareInstructions(product.careInstructions)
      : null;

    const variants = product.variants.map((v) => ({
      id: v.id,
      sku: v.sku ?? null,
      price: v.price,
      inventoryCount: v.inventoryCount,
      trackInventory: v.trackInventory,
      lowStockThreshold: v.lowStockThreshold,
      displayOrder: v.displayOrder,
      isBase: v.isBase,
      isActive: v.isActive,
      plantAttributes: v.plantAttributes
        ? {
            id: v.plantAttributes.id,
            growthStage: v.plantAttributes.growthStage,
            plantForm: v.plantAttributes.plantForm,
            variegation: v.plantAttributes.variegation,
            leafDensity: v.plantAttributes.leafDensity,
            stemCount: v.plantAttributes.stemCount,
            currentHeight: v.plantAttributes.currentHeight ?? null,
            currentSpread: v.plantAttributes.currentSpread ?? null,
            propagationType: v.plantAttributes.propagationType,
            containerType: v.plantAttributes.containerType,
            containerSize: v.plantAttributes.containerSize ?? null,
            bundleType: v.plantAttributes.bundleType ?? null,
          }
        : null,
      media: v.media.map((m) => ({
        id: m.id,
        mediaId: m.mediaId,
        displayOrder: m.displayOrder,
        type: m.type,
        isPrimary: m.isPrimary,
        url: m.media.url,
      })),
    }));

    return {
      id: product.id,
      slug: product.slug,
      status: product.status,
      thumbnail,
      translations,
      plantDetails,
      careInstructions,
      variants,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  private mapPlantDetails(details: any): PlantDetailResult['plantDetails'] {
    const category = details.category
      ? {
          id: details.category.id,
          slug: details.category.slug,
          translations: details.category.translations.map((t) => ({
            locale: t.locale,
            name: t.name,
          })),
        }
      : null;

    const tags = details.tags.map((pt) => ({
      id: pt.tag.id,
      slug: pt.tag.slug,
      translations: pt.tag.translations.map((t) => ({
        locale: t.locale,
        name: t.name,
      })),
    }));

    const translations = details.translations.map((t) => ({
      locale: t.locale,
      commonNames: t.commonNames ?? null,
      origin: t.origin ?? null,
      soilType: t.soilType ?? null,
      toxicityInfo: t.toxicityInfo ?? null,
    }));

    return {
      id: details.id,
      categoryId: details.categoryId ?? null,
      scientificName: details.scientificName ?? null,
      commonNames: details.commonNames ?? null,
      origin: details.origin ?? null,
      lightRequirement: details.lightRequirement ?? null,
      wateringFrequency: details.wateringFrequency ?? null,
      humidityLevel: details.humidityLevel ?? null,
      temperatureRange: details.temperatureRange ?? null,
      soilType: details.soilType ?? null,
      careDifficulty: details.careDifficulty ?? null,
      growthRate: details.growthRate ?? null,
      matureHeight: details.matureHeight ?? null,
      matureSpread: details.matureSpread ?? null,
      toxicityInfo: details.toxicityInfo ?? null,
      category,
      tags,
      translations,
    };
  }

  private mapCareInstructions(care: any): PlantDetailResult['careInstructions'] {
    const translations = care.translations.map((t) => ({
      locale: t.locale,
      lightInstructions: t.lightInstructions ?? null,
      wateringInstructions: t.wateringInstructions ?? null,
      humidityInstructions: t.humidityInstructions ?? null,
      fertilizerSchedule: t.fertilizerSchedule ?? null,
      repottingFrequency: t.repottingFrequency ?? null,
      pruningNotes: t.pruningNotes ?? null,
      commonProblems: t.commonProblems ?? null,
      seasonalCare: t.seasonalCare ?? null,
    }));

    return {
      id: care.id,
      lightInstructions: care.lightInstructions ?? null,
      wateringInstructions: care.wateringInstructions ?? null,
      humidityInstructions: care.humidityInstructions ?? null,
      fertilizerSchedule: care.fertilizerSchedule ?? null,
      repottingFrequency: care.repottingFrequency ?? null,
      pruningNotes: care.pruningNotes ?? null,
      commonProblems: care.commonProblems ?? null,
      seasonalCare: care.seasonalCare ?? null,
      translations,
    };
  }
}
