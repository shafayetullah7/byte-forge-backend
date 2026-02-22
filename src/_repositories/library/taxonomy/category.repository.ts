import { Injectable } from '@nestjs/common';
import { eq, ilike, isNotNull, isNull, and, SQL } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { categoriesTable, TNewCategory, TCategory } from '@/_db/drizzle/schema/taxonomy';

@Injectable()
export class CategoryRepository {
  constructor(private readonly db: DrizzleService) {}

  private buildWhere(options: any) {
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

  async findMany(query: any) {
    const where = this.buildWhere(query);
    const limit = query.limit ? Number(query.limit) : 20;
    const page = query.page ? Number(query.page) : 1;
    const offset = (page - 1) * limit;

    return this.db.client
      .select()
      .from(categoriesTable)
      .where(where)
      .limit(limit)
      .offset(offset);
  }

  async findOne(id: string): Promise<TCategory | undefined> {
    const result = await this.db.client
      .select()
      .from(categoriesTable)
      .where(and(eq(categoriesTable.id, id), isNull(categoriesTable.deletedAt)))
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
    const result = await tx
      .update(categoriesTable)
      .set(data)
      .where(and(eq(categoriesTable.id, id), isNull(categoriesTable.deletedAt)))
      .returning();
    return result[0];
  }

  async softDelete(tx: any, id: string): Promise<void> {
    await tx
      .update(categoriesTable)
      .set({ deletedAt: new Date(), isActive: false })
      .where(eq(categoriesTable.id, id));
  }
}
