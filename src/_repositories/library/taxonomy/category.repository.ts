import { Injectable } from '@nestjs/common';
import { eq, ilike, isNotNull, isNull, and, SQL, count, asc, desc, sql } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { categoriesTable, TNewCategory, TCategory } from '@/_db/drizzle/schema/taxonomy';
import { DrizzleTx } from '@/_db/drizzle/types';
import { TLockTransaction } from '../../_types/lock.transaction';


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

  async findMany(query: CategoryQueryDto, transaction?: TLockTransaction): Promise<TCategory[]> {
    const executor = this.db.getExecutor(transaction?.tx);
    const where = this.buildWhere(query);
    const limit = query.limit ? Number(query.limit) : 20;
    const page = query.page ? Number(query.page) : 1;
    const offset = (page - 1) * limit;

    const sortByField = query.sortBy === 'name' ? categoriesTable.name : query.sortBy === 'updatedAt' ? categoriesTable.updatedAt : categoriesTable.createdAt;
    const sortFn = query.sortOrder === 'asc' ? asc : desc;

    const baseQuery = executor
      .select()
      .from(categoriesTable)
      .where(where)
      .orderBy(sortFn(sortByField))
      .limit(limit)
      .offset(offset);

    const lockQuery = transaction?.lock ? baseQuery.for('update') : baseQuery;
    return await lockQuery.execute();
  }


  async count(query: CategoryQueryDto, transaction?: TLockTransaction): Promise<number> {
    const executor = this.db.getExecutor(transaction?.tx);
    const where = this.buildWhere(query);
    const [{ total }] = await executor
      .select({ total: count() })
      .from(categoriesTable)
      .where(where);
    return total;
  }


  async findOne(id: string, transaction?: TLockTransaction): Promise<TCategory | undefined> {
    const executor = this.db.getExecutor(transaction?.tx);
    const baseQuery = executor
      .select()
      .from(categoriesTable)
      .where(and(eq(categoriesTable.id, id), isNull(categoriesTable.deletedAt)))
      .limit(1);
    
    const lockQuery = transaction?.lock ? baseQuery.for('update') : baseQuery;
    const result = await lockQuery.execute();
    return result[0];
  }


  async create(data: TNewCategory, tx?: DrizzleTx): Promise<TCategory> {
    const executor = this.db.getExecutor(tx);
    const result = await executor
      .insert(categoriesTable)
      .values(data)
      .returning();
    return result[0];
  }


  async update(id: string, data: any, tx?: DrizzleTx): Promise<TCategory> {
    const executor = this.db.getExecutor(tx);
    const result = await executor
      .update(categoriesTable)
      .set(data)
      .where(and(eq(categoriesTable.id, id), isNull(categoriesTable.deletedAt)))
      .returning();
    return result[0];
  }


  async softDelete(id: string, tx?: DrizzleTx): Promise<void> {
    const executor = this.db.getExecutor(tx);
    await executor
      .update(categoriesTable)
      .set({ 
        deletedAt: new Date(), 
        isActive: false,
        slug: sql`${categoriesTable.slug} || '-deleted-' || ${Date.now()}`
      })
      .where(eq(categoriesTable.id, id));
  }


  async incrementUsageCount(id: string, amount = 1, tx?: DrizzleTx): Promise<void> {
    const executor = this.db.getExecutor(tx);
    await executor
      .update(categoriesTable)
      .set({
        usageCount: sql`${categoriesTable.usageCount} + ${amount}`,
      })
      .where(eq(categoriesTable.id, id));
  }

  async decrementUsageCount(id: string, amount = 1, tx?: DrizzleTx): Promise<void> {
    const executor = this.db.getExecutor(tx);
    await executor
      .update(categoriesTable)
      .set({
        usageCount: sql`${categoriesTable.usageCount} - ${amount}`,
      })
      .where(eq(categoriesTable.id, id));
  }

}
