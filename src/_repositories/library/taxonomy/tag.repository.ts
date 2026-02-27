import { Injectable } from '@nestjs/common';
import { eq, ilike, isNotNull, isNull, and, SQL, count, asc, desc, sql, inArray } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { tagsTable, tagGroupsTable, tagTranslationsTable, TNewTag, TTag, TNewTagTranslation } from '@/_db/drizzle/schema/taxonomy';
import { DrizzleTx } from '@/_db/drizzle/types';
import { TLockTransaction } from '../../_types/lock.transaction';


import { TagQueryDto } from '@/api/admin/admin-taxonomy/tags/dto/tag-query.dto';

@Injectable()
export class TagRepository {
  constructor(private readonly db: DrizzleService) {}

  private buildWhere(options: TagQueryDto) {
    const where:SQL[] = [];

    if (options.id) where.push(eq(tagsTable.id, options.id));
    if (options.groupId) where.push(eq(tagsTable.groupId, options.groupId));
    // Name and search filters are now handled in the service layer using i18n translation tables

    if (options.isActive !== undefined) {
      where.push(eq(tagsTable.isActive, options.isActive === 'true'));
    }

    // Default to showing only non-deleted
    where.push(isNull(tagsTable.deletedAt));

    return and(...where);
  }

  async findMany(query: TagQueryDto, transaction?: TLockTransaction) {
    const executor = this.db.getExecutor(transaction?.tx);
    const where = this.buildWhere(query);
    const limit = query.limit ? Number(query.limit) : 20;
    const page = query.page ? Number(query.page) : 1;
    const offset = (page - 1) * limit;

    const sortByField = query.sortBy === 'updatedAt' ? tagsTable.updatedAt : tagsTable.createdAt;
    const sortFn = query.sortOrder === 'asc' ? asc : desc;

    const baseQuery = executor
      .select({
        tag: tagsTable,
        group: {
          id: tagGroupsTable.id,
          slug: tagGroupsTable.slug,
        },
      })
      .from(tagsTable)
      .leftJoin(tagGroupsTable, eq(tagsTable.groupId, tagGroupsTable.id))
      .where(where)
      .orderBy(sortFn(sortByField))
      .limit(limit)
      .offset(offset);

    const lockQuery = transaction?.lock ? baseQuery.for('update') : baseQuery;
    return await lockQuery.execute();
  }


  async count(query: TagQueryDto, transaction?: TLockTransaction): Promise<number> {
    const executor = this.db.getExecutor(transaction?.tx);
    const where = this.buildWhere(query);
    const [{ total }] = await executor
      .select({ total: count() })
      .from(tagsTable)
      .where(where);
    return total;
  }


  async findOne(id: string, transaction?: TLockTransaction): Promise<TTag | undefined> {
    const executor = this.db.getExecutor(transaction?.tx);
    const baseQuery = executor
      .select()
      .from(tagsTable)
      .where(and(eq(tagsTable.id, id), isNull(tagsTable.deletedAt)))
      .limit(1);
    
    const lockQuery = transaction?.lock ? baseQuery.for('update') : baseQuery;
    const result = await lockQuery.execute();
    return result[0];
  }


  async findBySlugs(slugs: string[], transaction?: TLockTransaction): Promise<TTag[]> {
    if (!slugs.length) return [];
    const executor = this.db.getExecutor(transaction?.tx);
    return await executor.query.tagsTable.findMany({
      where: and(inArray(tagsTable.slug, slugs), isNull(tagsTable.deletedAt)),
    });
  }


  async create(data: { groupId: string; slug: string; isActive?: boolean }, tx?: DrizzleTx): Promise<TTag> {
    const executor = this.db.getExecutor(tx);
    const result = await executor
      .insert(tagsTable)
      .values({
        slug: data.slug,
        groupId: data.groupId,
        isActive: data.isActive ?? true,
      })
      .returning();
    return result[0];
  }


  async createMany(data: { groupId: string; slug: string; isActive?: boolean }[], tx?: DrizzleTx): Promise<TTag[]> {
    if (!data.length) return [];
    
    const executor = this.db.getExecutor(tx);
    return await executor
      .insert(tagsTable)
      .values(
        data.map((tag) => ({
          slug: tag.slug,
          groupId: tag.groupId,
          isActive: tag.isActive ?? true,
        }))
      )
      .returning();
  }


  async createTranslations(
    tagId: string,
    translations: { locale: string; name: string; description?: string }[],
    tx?: DrizzleTx
  ) {
    if (!translations.length) return [];
    
    const executor = this.db.getExecutor(tx);
    return await executor
      .insert(tagTranslationsTable)
      .values(
        translations.map((t) => ({
          tagId,
          locale: t.locale,
          name: t.name,
          description: t.description,
        }))
      )
      .returning();
  }


  async createManyTranslations(
    translations: TNewTagTranslation[],
    tx?: DrizzleTx
  ) {
    if (!translations.length) return [];
    
    const executor = this.db.getExecutor(tx);
    return await executor
      .insert(tagTranslationsTable)
      .values(translations)
      .returning();
  }


  async update(id: string, data: Partial<TNewTag>, tx?: DrizzleTx): Promise<TTag> {
    const executor = this.db.getExecutor(tx);
    const result = await executor
      .update(tagsTable)
      .set(data)
      .where(and(eq(tagsTable.id, id), isNull(tagsTable.deletedAt)))
      .returning();
    
    return result[0];
  }


  async softDelete(id: string, tx?: DrizzleTx): Promise<void> {
    const executor = this.db.getExecutor(tx);

    // 1. Hard-delete orphaned translations (no longer reachable after soft-delete)
    await executor
      .delete(tagTranslationsTable)
      .where(eq(tagTranslationsTable.tagId, id));

    // 2. Soft-delete the tag, mangling the slug to free the unique slot
    await executor
      .update(tagsTable)
      .set({ 
        deletedAt: new Date(), 
        isActive: false,
        slug: sql`${tagsTable.slug} || '-deleted-' || ${Date.now()}`
      })
      .where(eq(tagsTable.id, id));
  }

}
