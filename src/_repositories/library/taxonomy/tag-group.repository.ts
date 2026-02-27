import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { tagGroupsTable, tagsTable, tagGroupTranslationsTable, tagTranslationsTable, TNewTagGroup, TTagGroup } from '@/_db/drizzle/schema/taxonomy';
import { Injectable, BadRequestException } from '@nestjs/common';
import { eq, ilike, isNotNull, isNull, and, SQL, count, asc, desc, exists, sql } from 'drizzle-orm';
import { DrizzleTx } from '@/_db/drizzle/types';
import { TLockTransaction } from '../../_types/lock.transaction';


import { TagGroupQueryDto } from '@/api/admin/admin-taxonomy/tag-groups/dto/tag-group-query.dto';

@Injectable()
export class TagGroupRepository {
  constructor(private readonly db: DrizzleService) {}

  private buildWhere(options: TagGroupQueryDto) {
    const where:SQL[] = [];

    if (options.id) where.push(eq(tagGroupsTable.id, options.id));
    // Name and search filters are now handled in the service layer using i18n translation tables

    if (options.isActive !== undefined) {
      where.push(eq(tagGroupsTable.isActive, options.isActive === 'true'));
    }

    // Default to showing only non-deleted
    where.push(isNull(tagGroupsTable.deletedAt));

    return and(...where);
  }

  async findMany(query: TagGroupQueryDto, transaction?: TLockTransaction): Promise<Array<TTagGroup & { tags: any[] }>> {
    const executor = this.db.getExecutor(transaction?.tx);
    const where = this.buildWhere(query);
    const limit = query.limit ? Number(query.limit) : 10;
    const page = query.page ? Number(query.page) : 1;
    const offset = (page - 1) * limit;

    const sortByField = query.sortBy === 'updatedAt' ? tagGroupsTable.updatedAt : tagGroupsTable.createdAt;
    const sortFn = query.sortOrder === 'asc' ? asc : desc;

    const baseQuery = executor.query.tagGroupsTable.findMany({
      where,
      orderBy: [sortFn(sortByField)],
      limit,
      offset,
      with: {
        tags: {
          where: (tags, { isNull }) => isNull(tags.deletedAt),
        },
      },
    });

    return await baseQuery;
  }


  async count(query: TagGroupQueryDto, transaction?: TLockTransaction): Promise<number> {
    const executor = this.db.getExecutor(transaction?.tx);
    const where = this.buildWhere(query);
    const [{ total }] = await executor
      .select({ total: count() })
      .from(tagGroupsTable)
      .where(where);
    return total;
  }


  async findOne(id: string, transaction?: TLockTransaction): Promise<(TTagGroup & { tags: any[] }) | undefined> {
    const executor = this.db.getExecutor(transaction?.tx);
    return await executor.query.tagGroupsTable.findFirst({
      where: and(eq(tagGroupsTable.id, id), isNull(tagGroupsTable.deletedAt)),
      with: {
        tags: {
          where: (tags, { isNull }) => isNull(tags.deletedAt),
        },
      },
    });
  }


  async findBySlug(slug: string, transaction?: TLockTransaction): Promise<TTagGroup | undefined> {
    const executor = this.db.getExecutor(transaction?.tx);
    const result = await executor.query.tagGroupsTable.findFirst({
      where: and(eq(tagGroupsTable.slug, slug), isNull(tagGroupsTable.deletedAt)),
    });
    return result;
  }


  async create(data: { slug: string; isActive?: boolean }, tx?: DrizzleTx): Promise<TTagGroup> {
    const executor = this.db.getExecutor(tx);
    const result = await executor
      .insert(tagGroupsTable)
      .values({
        slug: data.slug,
        isActive: data.isActive ?? true,
      })
      .returning();
    return result[0];
  }


  async createTranslations(
    groupId: string,
    translations: { locale: string; name: string; description?: string }[],
    tx?: DrizzleTx
  ) {
    if (!translations.length) return [];
    
    const executor = this.db.getExecutor(tx);
    return await executor
      .insert(tagGroupTranslationsTable)
      .values(
        translations.map((t) => ({
          groupId,
          locale: t.locale,
          name: t.name,
          description: t.description,
        }))
      )
      .returning();
  }


  async update(id: string, data: any, tx?: DrizzleTx): Promise<TTagGroup> {
    const executor = this.db.getExecutor(tx);
    const result = await executor
      .update(tagGroupsTable)
      .set(data)
      .where(and(eq(tagGroupsTable.id, id), isNull(tagGroupsTable.deletedAt)))
      .returning();
    
    return result[0];
  }


  async softDelete(id: string, tx?: DrizzleTx): Promise<void> {
    const executor = this.db.getExecutor(tx);
    await executor
      .update(tagGroupsTable)
      .set({ 
        deletedAt: new Date(), 
        isActive: false,
        slug: sql`${tagGroupsTable.slug} || '-deleted-' || ${Date.now()}`
      })
      .where(eq(tagGroupsTable.id, id));
  }


  async incrementTagCount(id: string, amount = 1, tx?: DrizzleTx): Promise<void> {
    const executor = this.db.getExecutor(tx);
    await executor
      .update(tagGroupsTable)
      .set({
        tagCount: sql`${tagGroupsTable.tagCount} + ${amount}`,
      })
      .where(eq(tagGroupsTable.id, id));
  }

  async decrementTagCount(id: string, amount = 1, tx?: DrizzleTx): Promise<void> {
    const executor = this.db.getExecutor(tx);
    await executor
      .update(tagGroupsTable)
      .set({
        tagCount: sql`${tagGroupsTable.tagCount} - ${amount}`,
      })
      .where(eq(tagGroupsTable.id, id));
  }

}
