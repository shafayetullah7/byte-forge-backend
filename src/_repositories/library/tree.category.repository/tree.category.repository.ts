import { SQL, eq, and, isNull, isNotNull, ilike, or } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import {
  treeCategoryTable,
  TNewTreeCategory,
  TTreeCategory,
} from '@/_db/drizzle/schema';
import { Injectable } from '@nestjs/common';
import { DrizzlePgTransaction, DrizzleTx } from '@/_db/drizzle/types';
import { TLockTransaction } from '@/_repositories/_types/lock.transaction';

export interface TreeCategoryQuery {
  id?: string;
  searchKey?: string;
  name?: string;
  isHidden?: boolean;
  isDeleted?: boolean;
}

@Injectable()
export class TreeCategoryRepository {
  constructor(private readonly db: DrizzleService) {}

  private buildWhere(options?: TreeCategoryQuery): SQL[] {
    if (!options) return [];

    const where: SQL[] = [];

    if (options.id) where.push(eq(treeCategoryTable.id, options.id));
    if (options.name) where.push(eq(treeCategoryTable.name, options.name));
    if (options.searchKey) {
      const searchCondition = or(
        ilike(treeCategoryTable.name, `%${options.searchKey}%`),
      );
      if (searchCondition) where.push(searchCondition);
    }
    if (options.isHidden !== undefined)
      where.push(eq(treeCategoryTable.isHidden, options.isHidden));

    if (options.isDeleted !== undefined) {
      if (options.isDeleted) {
        where.push(isNotNull(treeCategoryTable.deletedAt));
      } else {
        where.push(isNull(treeCategoryTable.deletedAt));
      }
    }

    return where;
  }

  async findOne(
    options?: TreeCategoryQuery,
    tx?: DrizzleTx,
  ): Promise<TTreeCategory | null> {
    const executor = this.db.getExecutor(tx);
    const where = this.buildWhere(options);
    const [row] = await executor
      .select()
      .from(treeCategoryTable)
      .where(and(...where))
      .limit(1)
      .execute();
    return row ?? null;
  }

  async create(data: TNewTreeCategory, tx?: DrizzleTx): Promise<TTreeCategory> {
    const executor = this.db.getExecutor(tx);
    const [row] = await executor
      .insert(treeCategoryTable)
      .values(data)
      .returning();
    return row;
  }

  async update(
    data: Partial<TNewTreeCategory>,
    options: TreeCategoryQuery,
    tx?: DrizzleTx,
  ): Promise<TTreeCategory[]> {
    const executor = this.db.getExecutor(tx);
    const where = this.buildWhere(options);
    return await executor
      .update(treeCategoryTable)
      .set(data)
      .where(and(...where))
      .returning()
      .execute();
  }

  async delete(where: SQL, tx?: DrizzleTx): Promise<boolean> {
    const executor = this.db.getExecutor(tx);
    const deleted = await executor
      .delete(treeCategoryTable)
      .where(where)
      .returning()
      .execute();
    return deleted.length > 0;
  }

  async createCategory(payload: TNewTreeCategory, tx?: DrizzleTx) {
    const executor = this.db.getExecutor(tx);
    const [category] = await executor
      .insert(treeCategoryTable)
      .values(payload)
      .returning()
      .execute();
    return category;
  }

  async getAllCategories(query?: TreeCategoryQuery) {
    const where = this.buildWhere(query);
    return this.db.client
      .select()
      .from(treeCategoryTable)
      .where(and(...where))
      .execute();
  }

  async getCategoryById(id: string, transaction?: TLockTransaction) {
    const executor = this.db.getExecutor(transaction?.tx);
    const baseQuery = executor
      .select()
      .from(treeCategoryTable)
      .where(eq(treeCategoryTable.id, id));

    const finalQuery = transaction?.lock ? baseQuery.for('update') : baseQuery;
    const [category] = await finalQuery.execute();
    return category;
  }

  async softDeleteCategory(id: string, tx?: DrizzleTx) {
    const executor = this.db.getExecutor(tx);
    const [deletedCategory] = await executor
      .update(treeCategoryTable)
      .set({ deletedAt: new Date() })
      .where(eq(treeCategoryTable.id, id))
      .returning()
      .execute();
    return deletedCategory;
  }

  async updateCategory(
    id: string,
    payload: Partial<TNewTreeCategory>,
    tx?: DrizzleTx,
  ) {
    const executor = this.db.getExecutor(tx);
    const [updatedCategory] = await executor
      .update(treeCategoryTable)
      .set(payload)
      .where(eq(treeCategoryTable.id, id))
      .returning()
      .execute();
    return updatedCategory;
  }
}
