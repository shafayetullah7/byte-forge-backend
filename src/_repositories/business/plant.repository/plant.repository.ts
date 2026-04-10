import { Injectable } from '@nestjs/common';
import {
  plantTable,
  plantTranslationsTable,
  plantCareTable,
  plantSeoTable,
  plantMediaTable,
  plantVariantTable,
  TPlant,
  TNewPlant,
  TPlantTranslation,
  TNewPlantTranslation,
  TPlantCare,
  TNewPlantCare,
  TPlantSeo,
  TNewPlantSeo,
  TPlantMedia,
  TNewPlantMedia,
  TPlantVariant,
  TNewPlantVariant,
  shopTable,
  mediaTable,
} from '@/_db/drizzle/schema';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { SQL, eq, and, ilike, or, sql, exists, inArray } from 'drizzle-orm';
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
        ilike(plantTable.scientificName, `%${options.searchKey}%`),
        exists(
          this.db.client
            .select({ id: plantTranslationsTable.id })
            .from(plantTranslationsTable)
            .where(
              and(
                eq(plantTranslationsTable.plantId, plantTable.id),
                ilike(plantTranslationsTable.name, `%${options.searchKey}%`),
              ),
            ),
        ),
      );
      if (searchCondition) where.push(searchCondition);
    }

    return where;
  }

  // --- Core Operations ---

  async findOne(options?: PlantQuery, tx?: DrizzleTx): Promise<TPlant | null> {
    const executor = this.db.getExecutor(tx);
    const where = this.buildWhere(options);

    // Using query API instead of select for single record fetch
    const plant = await executor.query.plantTable.findFirst({
      where: and(...where),
      with: {
        shop: {
          columns: { status: true },
        },
      },
    });

    // Enforce active shop check if it's not a direct ID lookup that bypasses it
    if (plant && plant.shop.status !== 'ACTIVE') {
      return null;
    }

    return plant ?? null;
  }

  async createPlant(data: TNewPlant, tx?: DrizzleTx): Promise<TPlant> {
    const executor = this.db.getExecutor(tx);
    const [row] = await executor.insert(plantTable).values(data).returning();
    return row;
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
    // Get existing media IDs before delete
    const existingMedia = await tx
      .select({ mediaId: plantMediaTable.mediaId })
      .from(plantMediaTable)
      .where(eq(plantMediaTable.plantId, plantId));
    const existingMediaIds = existingMedia.map((m) => m.mediaId);

    // Delete existing media first
    await tx
      .delete(plantMediaTable)
      .where(eq(plantMediaTable.plantId, plantId));

    if (mediaItems.length > 0) {
      const items = mediaItems.map((item) => ({ ...item, plantId }));
      const newMedia = await tx
        .insert(plantMediaTable)
        .values(items)
        .returning();

      // Get new media IDs
      const newMediaIds = mediaItems.map((m) => m.mediaId);

      // Calculate which media to decrement (in old but not in new)
      const toDecrement = existingMediaIds.filter(
        (id) => !newMediaIds.includes(id),
      );
      // Calculate which media to increment (in new but not in old)
      const toIncrement = newMediaIds.filter(
        (id) => !existingMediaIds.includes(id),
      );

      // Decrement usage for removed media
      if (toDecrement.length > 0) {
        await tx
          .update(mediaTable)
          .set({ usesCount: sql`GREATEST(${mediaTable.usesCount} - 1, 0)` })
          .where(inArray(mediaTable.id, toDecrement));
      }

      // Increment usage for new media
      if (toIncrement.length > 0) {
        await tx
          .update(mediaTable)
          .set({ usesCount: sql`${mediaTable.usesCount} + 1` })
          .where(inArray(mediaTable.id, toIncrement));
      }

      return newMedia;
    }

    // If we had old media and now empty, decrement all old
    if (existingMediaIds.length > 0) {
      await tx
        .update(mediaTable)
        .set({ usesCount: sql`GREATEST(${mediaTable.usesCount} - 1, 0)` })
        .where(inArray(mediaTable.id, existingMediaIds));
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

  async upsertTranslation(
    data: TNewPlantTranslation,
    tx: DrizzleTx,
  ): Promise<TPlantTranslation> {
    const [row] = await tx
      .insert(plantTranslationsTable)
      .values(data)
      .onConflictDoUpdate({
        target: [plantTranslationsTable.plantId, plantTranslationsTable.locale],
        set: data,
      })
      .returning();
    return row;
  }
}
