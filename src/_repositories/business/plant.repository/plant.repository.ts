import { Injectable } from '@nestjs/common';
import {
  plantTable,
  plantPricingTable,
  plantInventoryTable,
  plantCareTable,
  plantSeoTable,
  plantMediaTable,
  plantVariantTable,
  TPlant,
  TNewPlant,
  TPlantPricing,
  TNewPlantPricing,
  TPlantInventory,
  TNewPlantInventory,
  TPlantCare,
  TNewPlantCare,
  TPlantSeo,
  TNewPlantSeo,
  TPlantMedia,
  TNewPlantMedia,
  TPlantVariant,
  TNewPlantVariant,
} from '@/_db/drizzle/schema';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { SQL, eq, and, ilike, or, sql } from 'drizzle-orm';
import { DrizzleTx } from '@/_db/drizzle/types';

export interface PlantQuery {
  id?: string;
  shopId?: string;
  categoryId?: string | null;
  status?: string;
  isFeatured?: boolean;
  searchKey?: string;
}

@Injectable()
export class PlantRepository {
  constructor(private readonly db: DrizzleService) {}

  private buildWhere(options?: PlantQuery): SQL[] {
    if (!options) return [];
    const where: SQL[] = [];

    if (options.id) where.push(eq(plantTable.id, options.id));
    if (options.shopId) where.push(eq(plantTable.shopId, options.shopId));

    if (options.categoryId !== undefined) {
      if (options.categoryId === null) {
        where.push(sql`${plantTable.categoryId} IS NULL`);
      } else {
        where.push(eq(plantTable.categoryId, options.categoryId));
      }
    }

    if (options.status) where.push(eq(plantTable.status, options.status));
    if (typeof options.isFeatured === 'boolean')
      where.push(eq(plantTable.isFeatured, options.isFeatured));

    if (options.searchKey) {
      const searchCondition = or(
        ilike(plantTable.name, `%${options.searchKey}%`),
        ilike(plantTable.scientificName, `%${options.searchKey}%`),
      );
      if (searchCondition) where.push(searchCondition);
    }

    return where;
  }

  // --- Core Operations ---

  async getAllPlants(options?: PlantQuery, tx?: DrizzleTx): Promise<TPlant[]> {
    const executor = this.db.getExecutor(tx);
    const where = this.buildWhere(options);
    const query = executor
      .select()
      .from(plantTable)
      .where(and(...where));

    return await query.execute();
  }

  async createPlant(data: TNewPlant, tx?: DrizzleTx): Promise<TPlant> {
    const executor = this.db.getExecutor(tx);
    const [plant] = await executor.insert(plantTable).values(data).returning();
    return plant;
  }

  async findOne(options?: PlantQuery, tx?: DrizzleTx): Promise<TPlant | null> {
    const executor = this.db.getExecutor(tx);
    const where = this.buildWhere(options);
    const [row] = await executor
      .select()
      .from(plantTable)
      .where(and(...where))
      .limit(1)
      .execute();
    return row ?? null;
  }

  async update(
    data: Partial<TNewPlant>,
    options: PlantQuery,
    tx?: DrizzleTx,
  ): Promise<TPlant[]> {
    const executor = this.db.getExecutor(tx);
    const where = this.buildWhere(options);
    return await executor
      .update(plantTable)
      .set(data)
      .where(and(...where))
      .returning()
      .execute();
  }

  async delete(where: SQL, tx?: DrizzleTx): Promise<boolean> {
    const executor = this.db.getExecutor(tx);
    const deleted = await executor
      .delete(plantTable)
      .where(where)
      .returning()
      .execute();
    return deleted.length > 0;
  }

  // --- Modular Helpers (Transactional Updates) ---

  async upsertPricing(
    data: TNewPlantPricing,
    tx: DrizzleTx,
  ): Promise<TPlantPricing> {
    const [row] = await tx
      .insert(plantPricingTable)
      .values(data)
      .onConflictDoUpdate({
        target: plantPricingTable.plantId,
        set: data,
      })
      .returning();
    return row;
  }

  async upsertInventory(
    data: TNewPlantInventory,
    tx: DrizzleTx,
  ): Promise<TPlantInventory> {
    const [row] = await tx
      .insert(plantInventoryTable)
      .values(data)
      .onConflictDoUpdate({
        target: plantInventoryTable.plantId,
        set: data,
      })
      .returning();
    return row;
  }

  async upsertCare(data: TNewPlantCare, tx: DrizzleTx): Promise<TPlantCare> {
    const [row] = await tx
      .insert(plantCareTable)
      .values(data)
      .onConflictDoUpdate({
        target: plantCareTable.plantId,
        set: data,
      })
      .returning();
    return row;
  }

  async upsertSeo(data: TNewPlantSeo, tx: DrizzleTx): Promise<TPlantSeo> {
    const [row] = await tx
      .insert(plantSeoTable)
      .values(data)
      .onConflictDoUpdate({
        target: plantSeoTable.plantId,
        set: data,
      })
      .returning();
    return row;
  }

  async syncMedia(
    plantId: string,
    mediaItems: Omit<TNewPlantMedia, 'plantId'>[],
    tx: DrizzleTx,
  ): Promise<TPlantMedia[]> {
    // Delete existing media first
    await tx
      .delete(plantMediaTable)
      .where(eq(plantMediaTable.plantId, plantId));

    if (mediaItems.length > 0) {
      const items = mediaItems.map((item) => ({ ...item, plantId }));
      return await tx.insert(plantMediaTable).values(items).returning();
    }
    return [];
  }

  async syncVariants(
    plantId: string,
    variants: Omit<TNewPlantVariant, 'plantId'>[],
    tx: DrizzleTx,
  ): Promise<TPlantVariant[]> {
    // Delete existing variants
    await tx
      .delete(plantVariantTable)
      .where(eq(plantVariantTable.plantId, plantId));

    if (variants.length > 0) {
      const items = variants.map((v) => ({ ...v, plantId }));
      return await tx.insert(plantVariantTable).values(items).returning();
    }
    return [];
  }
}
