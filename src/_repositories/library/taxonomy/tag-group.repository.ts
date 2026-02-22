import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { tagGroupsTable, TNewTagGroup, TTagGroup } from '@/_db/drizzle/schema/taxonomy';
import { Injectable } from '@nestjs/common';
import { eq, ilike, isNotNull, isNull, and, SQL } from 'drizzle-orm';

@Injectable()
export class TagGroupRepository {
  constructor(private readonly db: DrizzleService) {}

  private buildWhere(options: any) {
    const where:SQL[] = [];

    if (options.id) where.push(eq(tagGroupsTable.id, options.id));
    if (options.name) where.push(eq(tagGroupsTable.name, options.name));
    
    if (options.searchKey) {
      where.push(ilike(tagGroupsTable.name, `%${options.searchKey}%`));
    }

    if (options.isActive !== undefined) {
      where.push(eq(tagGroupsTable.isActive, options.isActive));
    }

    if (options.isDeleted !== undefined) {
      if (options.isDeleted) {
        where.push(isNotNull(tagGroupsTable.deletedAt));
      } else {
        where.push(isNull(tagGroupsTable.deletedAt));
      }
    } else {
        // Default to showing only non-deleted
        where.push(isNull(tagGroupsTable.deletedAt));
    }

    return and(...where);
  }

  async findMany(query: any): Promise<TTagGroup[]> {
    const where = this.buildWhere(query);
    const limit = query.limit ? Number(query.limit) : 10;
    const page = query.page ? Number(query.page) : 1;
    const offset = (page - 1) * limit;

    return this.db.client
      .select()
      .from(tagGroupsTable)
      .where(where)
      .limit(limit)
      .offset(offset);
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
