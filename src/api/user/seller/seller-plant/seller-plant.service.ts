import { Injectable, NotFoundException } from '@nestjs/common';
import { PlantRepository } from '@/_repositories/business/plant.repository/plant.repository';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import {
  plantTable,
  TNewPlant,
  shopTable,
  plantTranslationsTable,
  TPlantTranslation,
} from '@/_db/drizzle/schema';
import { and, eq, sql, asc, desc, or, ilike, SQL, exists } from 'drizzle-orm';
import {
  CreatePlantDto,
  UpdatePlantDto,
  PlantFilterDto,
} from './dto/plant.dto';
import { paginate } from '@/common/utils/pagination.util';
import { resolveTranslation } from '@/common/utils/resolve-translation.util';

@Injectable()
export class SellerPlantService {
  constructor(
    private readonly repository: PlantRepository,
    private readonly drizzle: DrizzleService,
  ) {}

  async createPlant(shopId: string, payload: CreatePlantDto, lang: string) {
    const { care, seo, media, variants, translations, ...coreData } = payload;

    return await this.drizzle.client.transaction(async (tx) => {
      // 1. Create Core Plant
      const plant = await this.repository.createPlant(
        { ...coreData, shopId },
        tx,
      );

      // 2. Create/Update Care
      if (care) {
        await this.repository.upsertCare({ ...care, plantId: plant.id }, tx);
      }

      // 3. Create/Update SEO
      if (seo) {
        await this.repository.upsertSeo({ ...seo, plantId: plant.id }, tx);
      }

      // 4. Sync Media
      if (media) {
        await this.repository.syncMedia(plant.id, media, tx);
      }

      // 5. Sync Variants (Mandatory in DTO)
      await this.repository.syncVariants(plant.id, variants, tx);

      // 6. Upsert Translations
      if (translations && translations.length > 0) {
        for (const t of translations) {
          await this.repository.upsertTranslation(
            { ...t, plantId: plant.id },
            tx,
          );
        }
      }

      const createdPlant = await this.getPlantById(plant.id, shopId, lang, tx);
      return createdPlant;
    });
  }

  async getAllPlants(shopId: string, lang: string, filter?: PlantFilterDto) {
    const limit = filter?.limit || 10;
    const page = filter?.page || 1;
    const offset = (page - 1) * limit;

    const sortBy = filter?.sortBy || 'createdAt';
    const sortOrder = filter?.sortOrder || 'desc';
    const sortFn = sortOrder === 'asc' ? asc : desc;

    const where: SQL[] = [eq(plantTable.shopId, shopId)];

    if (filter?.categoryId)
      where.push(eq(plantTable.categoryId, filter.categoryId));
    if (filter?.status) where.push(eq(plantTable.status, filter.status));
    if (typeof filter?.isFeatured === 'boolean')
      where.push(eq(plantTable.isFeatured, filter.isFeatured));

    if (filter?.searchKey) {
      where.push(
        or(
          ilike(plantTable.scientificName, `%${filter.searchKey}%`),
          exists(
            this.drizzle.client
              .select({ id: plantTranslationsTable.id })
              .from(plantTranslationsTable)
              .where(
                and(
                  eq(plantTranslationsTable.plantId, plantTable.id),
                  ilike(plantTranslationsTable.name, `%${filter.searchKey}%`),
                ),
              ),
          ),
        )!,
      );
    }

    const [data, [{ count }]] = await Promise.all([
      this.drizzle.client.query.plantTable.findMany({
        where: and(eq(shopTable.status, 'ACTIVE'), ...where),
        orderBy: [
          sortBy === 'name'
            ? sortFn(plantTable.createdAt) // Fallback sorting for now
            : sortFn(plantTable[sortBy as keyof typeof plantTable] as any),
        ],
        limit,
        offset,
        with: {
          translations: true,
          shop: true,
          variants: true,
          media: true,
        },
      }),
      this.drizzle.client
        .select({ count: sql`count(*)`.mapWith(Number) })
        .from(plantTable)
        .innerJoin(shopTable, eq(shopTable.id, plantTable.shopId))
        .where(and(eq(shopTable.status, 'ACTIVE'), ...where))
        .execute(),
    ]);

    const localized = data.map((p) => this.mapToLocalizedPlant(p, lang));
    return paginate(localized, count, page, limit);
  }

  async getPlantById(id: string, shopId: string, lang: string, tx?: any) {
    const executor = tx || this.drizzle.client;
    const plant = await executor.query.plantTable.findFirst({
      where: and(eq(plantTable.id, id), eq(plantTable.shopId, shopId)),
      with: {
        translations: true,
        variants: true,
        media: true,
        care: true,
        seo: true,
      },
    });

    if (!plant) throw new NotFoundException('Plant not found');

    return this.mapToLocalizedPlant(plant, lang);
  }

  async updatePlant(
    id: string,
    shopId: string,
    payload: UpdatePlantDto,
    lang: string,
  ) {
    const { care, seo, media, variants, translations, ...coreData } = payload;

    await this.getPlantById(id, shopId, lang);

    return await this.drizzle.client.transaction(async (tx) => {
      // 1. Update core data if any
      if (Object.keys(coreData).length > 0) {
        await this.repository.update(coreData, { id, shopId }, tx);
      }

      // 2. Update modules
      if (care) await this.repository.upsertCare({ ...care, plantId: id }, tx);
      if (seo) await this.repository.upsertSeo({ ...seo, plantId: id }, tx);
      if (media) await this.repository.syncMedia(id, media, tx);
      if (variants) await this.repository.syncVariants(id, variants, tx);

      // Update translations
      if (translations && translations.length > 0) {
        for (const t of translations) {
          await this.repository.upsertTranslation({ ...t, plantId: id }, tx);
        }
      }

      return await this.getPlantById(id, shopId, lang, tx);
    });
  }

  async deletePlant(id: string, shopId: string) {
    await this.getPlantById(id, shopId, 'en'); // Use 'en' as default for existence check
    // Cascade is handled at schema level, but we can do it manually if needed.
    // Drizzle will handle it via.references(() => ..., { onDelete: 'cascade' })
    return await this.repository.delete(
      and(eq(plantTable.id, id), eq(plantTable.shopId, shopId))!,
    );
  }

  private mapToLocalizedPlant(plant: any, lang: string) {
    const translation = resolveTranslation(
      plant.translations as TPlantTranslation[],
      lang,
    );

    // Map variants with their specific data
    const variants = (plant.variants || []).map((v: any) => {
      // Find media specifically linked to this variant
      const variantMedia = (plant.media || []).filter(
        (m: any) => m.variantId === v.id,
      );

      return {
        ...v,
        media: variantMedia,
      };
    });

    return {
      ...plant,
      name: translation?.name ?? 'Unnamed Plant',
      description: translation?.description ?? '',
      shortDescription: translation?.shortDescription ?? '',
      variants,
    };
  }
}
