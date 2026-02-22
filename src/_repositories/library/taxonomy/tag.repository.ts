import { Injectable } from '@nestjs/common';
import { eq, ilike, isNotNull, isNull, and, SQL } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { tagsTable, tagGroupsTable, TNewTag, TTag } from '@/_db/drizzle/schema/taxonomy';

@Injectable()
export class TagRepository {
  constructor(private readonly db: DrizzleService) {}

  private buildWhere(options: any) {
    const where:SQL[] = [];

    if (options.id) where.push(eq(tagsTable.id, options.id));
    if (options.groupId) where.push(eq(tagsTable.groupId, options.groupId));
    if (options.name) where.push(eq(tagsTable.name, options.name));
    
    if (options.searchKey) {
      where.push(ilike(tagsTable.name, `%${options.searchKey}%`));
    }

    if (options.isActive !== undefined) {
      where.push(eq(tagsTable.isActive, options.isActive));
    }

    if (options.isDeleted !== undefined) {
      if (options.isDeleted) {
        where.push(isNotNull(tagsTable.deletedAt));
      } else {
        where.push(isNull(tagsTable.deletedAt));
      }
    } else {
        where.push(isNull(tagsTable.deletedAt));
    }

    return and(...where);
  }

  async findMany(query: any) {
    const where = this.buildWhere(query);
    const limit = query.limit ? Number(query.limit) : 20;
    const page = query.page ? Number(query.page) : 1;
    const offset = (page - 1) * limit;

    return this.db.client
      .select({
        tag: tagsTable,
        group: {
            id: tagGroupsTable.id,
            name: tagGroupsTable.name
        }
      })
      .from(tagsTable)
      .innerJoin(tagGroupsTable, eq(tagsTable.groupId, tagGroupsTable.id))
      .where(where)
      .limit(limit)
      .offset(offset);
  }

  async findOne(id: string): Promise<TTag | undefined> {
    const result = await this.db.client
      .select()
      .from(tagsTable)
      .where(and(eq(tagsTable.id, id), isNull(tagsTable.deletedAt)))
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
    const result = await this.db.client
      .update(tagsTable)
      .set(data)
      .where(and(eq(tagsTable.id, id), isNull(tagsTable.deletedAt)))
      .returning();
    
    return result[0];
  }

  async softDelete(id: string): Promise<void> {
    await this.db.client
      .update(tagsTable)
      .set({ deletedAt: new Date(), isActive: false })
      .where(eq(tagsTable.id, id));
  }
}
