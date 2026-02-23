import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { tagGroupsTable, TNewTagGroup, TTagGroup } from '@/_db/drizzle/schema/taxonomy';
import { Injectable } from '@nestjs/common';
import { eq, ilike, isNotNull, isNull, and, SQL, count, asc, desc } from 'drizzle-orm';

import { TagGroupQueryDto } from '@/api/admin/admin-taxonomy/tag-groups/dto/tag-group-query.dto';

@Injectable()
export class TagGroupRepository {
  constructor(private readonly db: DrizzleService) {}

  private buildWhere(options: TagGroupQueryDto) {
    const where:SQL[] = [];

    if (options.id) where.push(eq(tagGroupsTable.id, options.id));
    if (options.name) where.push(eq(tagGroupsTable.name, options.name));
    
    if (options.search) {
      where.push(ilike(tagGroupsTable.name, `%${options.search}%`));
    }

    if (options.isActive !== undefined) {
      where.push(eq(tagGroupsTable.isActive, options.isActive === 'true'));
    }

    // Default to showing only non-deleted
    where.push(isNull(tagGroupsTable.deletedAt));

    return and(...where);
  }

  async findMany(query: TagGroupQueryDto): Promise<Array<TTagGroup & { tags: any[] }>> {
    const where = this.buildWhere(query);
    const limit = query.limit ? Number(query.limit) : 10;
    const page = query.page ? Number(query.page) : 1;
    const offset = (page - 1) * limit;

    const sortByField = query.sortBy === 'name' ? tagGroupsTable.name : query.sortBy === 'updatedAt' ? tagGroupsTable.updatedAt : tagGroupsTable.createdAt;
    const sortFn = query.sortOrder === 'asc' ? asc : desc;

    return await this.db.client.query.tagGroupsTable.findMany({
      where,
      orderBy: [sortFn(sortByField)],
      limit,
      offset,
      with: {
        tags: true,
      },
    });
  }

  async count(query: TagGroupQueryDto): Promise<number> {
    const where = this.buildWhere(query);
    const [{ total }] = await this.db.client
      .select({ total: count() })
      .from(tagGroupsTable)
      .where(where);
    return total;
  }

  async findOne(id: string): Promise<TTagGroup | undefined> {
    const result = await this.db.client
      .select()
      .from(tagGroupsTable)
      .where(and(eq(tagGroupsTable.id, id), isNull(tagGroupsTable.deletedAt)))
      .limit(1);
    
    return result[0];
  }

  async create(data: TNewTagGroup): Promise<TTagGroup> {
    const result = await this.db.client
      .insert(tagGroupsTable)
      .values(data)
      .returning();
    
    return result[0];
  }

  async update(id: string, data: Partial<TNewTagGroup>): Promise<TTagGroup> {
    const result = await this.db.client
      .update(tagGroupsTable)
      .set(data)
      .where(and(eq(tagGroupsTable.id, id), isNull(tagGroupsTable.deletedAt)))
      .returning();
    
    return result[0];
  }

  async softDelete(id: string): Promise<void> {
    await this.db.client
      .update(tagGroupsTable)
      .set({ deletedAt: new Date(), isActive: false })
      .where(eq(tagGroupsTable.id, id));
  }
}
