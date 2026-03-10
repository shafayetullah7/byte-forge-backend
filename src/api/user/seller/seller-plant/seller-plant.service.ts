import { Injectable, NotFoundException } from '@nestjs/common';
import { PlantRepository } from '@/_repositories/business/plant.repository/plant.repository';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { plantTable, TNewPlant, shopTable } from '@/_db/drizzle/schema';
import { and, eq, sql, asc, desc, or, ilike, SQL } from 'drizzle-orm';
import {
  CreatePlantDto,
  UpdatePlantDto,
  PlantFilterDto,
} from './dto/plant.dto';
import { paginate } from '@/common/utils/pagination.util';

@Injectable()
export class SellerPlantService {
  constructor(
    private readonly repository: PlantRepository,
    private readonly drizzle: DrizzleService,
  ) {}

  async createPlant(shopId: string, payload: CreatePlantDto) {
    const { pricing, inventory, care, seo, media, variants, ...coreData } =
      payload;

    return await this.drizzle.client.transaction(async (tx) => {
      // 1. Create Core Plant
      const plant = await this.repository.createPlant(
        { ...coreData, shopId },
        tx,
      );

      // 2. Create/Update Pricing
      if (pricing) {
        await this.repository.upsertPricing(
          { ...pricing, plantId: plant.id },
          tx,
        );
      }

      // 3. Create/Update Inventory
      if (inventory) {
        await this.repository.upsertInventory(
          { ...inventory, plantId: plant.id },
          tx,
        );
      }

      // 4. Create/Update Care
      if (care) {
        await this.repository.upsertCare({ ...care, plantId: plant.id }, tx);
      }

      // 5. Create/Update SEO
      if (seo) {
        await this.repository.upsertSeo({ ...seo, plantId: plant.id }, tx);
      }

      // 6. Sync Media
      if (media) {
        await this.repository.syncMedia(plant.id, media, tx);
      }

      // 7. Sync Variants
      if (variants) {
        await this.repository.syncVariants(plant.id, variants, tx);
      }

      return plant;
    });
  }

  async getAllPlants(shopId: string, filter?: PlantFilterDto) {
    const limit = filter?.limit || 10;
    const page = filter?.page || 1;
    const offset = (page - 1) * limit;

    const sortBy = filter?.sortBy || 'createdAt';
    const sortOrder = filter?.sortOrder || 'desc';
    const sortFn = sortOrder === 'asc' ? asc : desc;

    const where: SQL[] = [eq(plantTable.shopId, shopId)];

    if (filter?.categoryId) where.push(eq(plantTable.categoryId, filter.categoryId));
    if (filter?.status) where.push(eq(plantTable.status, filter.status));
    if (typeof filter?.isFeatured === 'boolean')
      where.push(eq(plantTable.isFeatured, filter.isFeatured));

    if (filter?.searchKey) {
      where.push(
        or(
          ilike(plantTable.name, `%${filter.searchKey}%`),
          ilike(plantTable.scientificName, `%${filter.searchKey}%`),
        )!,
      );
    }

    const [data, [{ count }]] = await Promise.all([
      this.drizzle.client.query.plantTable.findMany({
        where: and(
          eq(shopTable.status, 'ACTIVE'),
          ...where,
        ),
        with: {
             shop: true
        },
        orderBy: [sortFn(plantTable[sortBy as keyof typeof plantTable] as any)],
        limit,
        offset,
      }),
      this.drizzle.client
        .select({ count: sql`count(*)`.mapWith(Number) })
        .from(plantTable)
        .innerJoin(shopTable, eq(shopTable.id, plantTable.shopId))
        .where(and(eq(shopTable.status, 'ACTIVE'), ...where))
        .execute(),
    ]);

    return paginate(data, count, page, limit);
  }

  async getPlantById(id: string, shopId: string) {
    const plant = await this.repository.findOne({ id, shopId });
    if (!plant) throw new NotFoundException('Plant not found');
    return plant;
  }

  async updatePlant(id: string, shopId: string, payload: UpdatePlantDto) {
    const { pricing, inventory, care, seo, media, variants, ...coreData } =
      payload;

    const existing = await this.getPlantById(id, shopId);

    return await this.drizzle.client.transaction(async (tx) => {
      // 1. Update core data if any
      if (Object.keys(coreData).length > 0) {
        await this.repository.update(coreData, { id, shopId }, tx);
      }

      // 2. Update modules
      if (pricing)
        await this.repository.upsertPricing({ ...pricing, plantId: id }, tx);
      if (inventory)
        await this.repository.upsertInventory(
          { ...inventory, plantId: id },
          tx,
        );
      if (care) await this.repository.upsertCare({ ...care, plantId: id }, tx);
      if (seo) await this.repository.upsertSeo({ ...seo, plantId: id }, tx);
      if (media) await this.repository.syncMedia(id, media, tx);
      if (variants) await this.repository.syncVariants(id, variants, tx);

      return { id, message: 'Plant updated successfully' };
    });
  }

  async deletePlant(id: string, shopId: string) {
    const existing = await this.getPlantById(id, shopId);
    // Cascade is handled at schema level, but we can do it manually if needed.
    // Drizzle will handle it via.references(() => ..., { onDelete: 'cascade' })
    return await this.repository.delete(
      and(eq(plantTable.id, id), eq(plantTable.shopId, shopId))!,
    );
  }
}
