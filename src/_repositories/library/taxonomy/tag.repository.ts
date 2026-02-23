import { Injectable } from '@nestjs/common';
import { eq, ilike, isNotNull, isNull, and, SQL, count, asc, desc } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { tagsTable, tagGroupsTable, TNewTag, TTag } from '@/_db/drizzle/schema/taxonomy';

import { TagQueryDto } from '@/api/admin/admin-taxonomy/tags/dto/tag-query.dto';

@Injectable()
export class TagRepository {
  constructor(private readonly db: DrizzleService) {}

  private buildWhere(options: TagQueryDto) {
    const where:SQL[] = [];

    if (options.id) where.push(eq(tagsTable.id, options.id));
    if (options.groupId) where.push(eq(tagsTable.groupId, options.groupId));
    if (options.name) where.push(eq(tagsTable.name, options.name));
    
    if (options.search) {
      where.push(ilike(tagsTable.name, `%${options.search}%`));
    }

    if (options.isActive !== undefined) {
      where.push(eq(tagsTable.isActive, options.isActive === 'true'));
    }

    // Default to showing only non-deleted
    where.push(isNull(tagsTable.deletedAt));

    return and(...where);
  }

  async findMany(query: TagQueryDto) {
    const where = this.buildWhere(query);
    const limit = query.limit ? Number(query.limit) : 20;
    const page = query.page ? Number(query.page) : 1;
    const offset = (page - 1) * limit;

    const sortByField = query.sortBy === 'name' ? tagsTable.name : query.sortBy === 'updatedAt' ? tagsTable.updatedAt : tagsTable.createdAt;
    const sortFn = query.sortOrder === 'asc' ? asc : desc;

    return await this.db.client
      .select({
        tag: tagsTable,
        group: {
          id: tagGroupsTable.id,
          name: tagGroupsTable.name,
        },
      })
      .from(tagsTable)
      .leftJoin(tagGroupsTable, eq(tagsTable.groupId, tagGroupsTable.id))
      .where(where)
      .orderBy(sortFn(sortByField))
      .limit(limit)
      .offset(offset);
  }

  async count(query: TagQueryDto): Promise<number> {
    const where = this.buildWhere(query);
    const [{ total }] = await this.db.client
      .select({ total: count() })
      .from(tagsTable)
      .where(where);
    return total;
  }

  async findOne(id: string): Promise<TTag | undefined> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const condition = isUuid ? eq(tagsTable.id, id) : eq(tagsTable.slug, id);

    const result = await this.db.client
      .select()
      .from(tagsTable)
      .where(and(condition, isNull(tagsTable.deletedAt)))
      .limit(1);
    
    return result[0];
  }

  async create(data: TNewTag): Promise<TTag> {
    const result = await this.db.client
      .insert(tagsTable)
      .values(data)
      .returning();
    
    return result[0];
  }

  async update(id: string, data: Partial<TNewTag>): Promise<TTag> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const condition = isUuid ? eq(tagsTable.id, id) : eq(tagsTable.slug, id);

    const result = await this.db.client
      .update(tagsTable)
      .set(data)
      .where(and(condition, isNull(tagsTable.deletedAt)))
      .returning();
    
    return result[0];
  }

  async softDelete(id: string): Promise<void> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const condition = isUuid ? eq(tagsTable.id, id) : eq(tagsTable.slug, id);

    await this.db.client
      .update(tagsTable)
      .set({ deletedAt: new Date(), isActive: false })
      .where(condition);
  }
}
