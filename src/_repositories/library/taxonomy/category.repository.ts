import { Injectable } from '@nestjs/common';
import { eq, ilike, isNotNull, isNull, and, SQL, count, asc, desc } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { categoriesTable, TNewCategory, TCategory } from '@/_db/drizzle/schema/taxonomy';

import { CategoryQueryDto } from '@/api/admin/admin-taxonomy/categories/dto/category-query.dto';

@Injectable()
export class CategoryRepository {
  constructor(private readonly db: DrizzleService) {}

  private buildWhere(options: CategoryQueryDto) {
    const where:SQL[] = [];

    where.push(isNull(categoriesTable.deletedAt));

    if (options?.isActive !== undefined) {
      where.push(eq(categoriesTable.isActive, options.isActive === 'true'));
    }

    if (options?.search) {
      where.push(ilike(categoriesTable.name, `%${options.search}%`));
    }

    return and(...where);
  }

  async findMany(query: CategoryQueryDto): Promise<TCategory[]> {
    const where = this.buildWhere(query);
    const limit = query.limit ? Number(query.limit) : 20;
    const page = query.page ? Number(query.page) : 1;
    const offset = (page - 1) * limit;

    const sortByField = query.sortBy === 'name' ? categoriesTable.name : query.sortBy === 'updatedAt' ? categoriesTable.updatedAt : categoriesTable.createdAt;
    const sortFn = query.sortOrder === 'asc' ? asc : desc;

    return await this.db.client
      .select()
      .from(categoriesTable)
      .where(where)
      .orderBy(sortFn(sortByField))
      .limit(limit)
      .offset(offset);
  }

  async count(query: CategoryQueryDto): Promise<number> {
    const where = this.buildWhere(query);
    const [{ total }] = await this.db.client
      .select({ total: count() })
      .from(categoriesTable)
      .where(where);
    return total;
  }

  async findOne(id: string): Promise<TCategory | undefined> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const condition = isUuid ? eq(categoriesTable.id, id) : eq(categoriesTable.slug, id);
    
    const result = await this.db.client
      .select()
      .from(categoriesTable)
      .where(and(condition, isNull(categoriesTable.deletedAt)))
      .limit(1);
    return result[0];
  }

  async create(tx: any, data: TNewCategory): Promise<TCategory> {
    const result = await tx
      .insert(categoriesTable)
      .values(data)
      .returning();
    return result[0];
  }

  async update(tx: any, id: string, data: Partial<TNewCategory>): Promise<TCategory> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const condition = isUuid ? eq(categoriesTable.id, id) : eq(categoriesTable.slug, id);

    const result = await tx
      .update(categoriesTable)
      .set(data)
      .where(and(condition, isNull(categoriesTable.deletedAt)))
      .returning();
    return result[0];
  }

  async softDelete(tx: any, id: string): Promise<void> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const condition = isUuid ? eq(categoriesTable.id, id) : eq(categoriesTable.slug, id);

    await tx
      .update(categoriesTable)
      .set({ deletedAt: new Date(), isActive: false })
      .where(condition);
  }
}
