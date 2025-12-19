import { Injectable, NotFoundException } from '@nestjs/common';
import {
  mediaTable,
  TNewTreeCategory,
  treeCategoryTable,
} from '@/_db/drizzle/schema';
import {
  CategoryFilterDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto/category.dto';
import { TreeCategoryRepository } from '@/_repositories/library/tree.category.repository/tree.category.repository';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { and, eq } from 'drizzle-orm';

@Injectable()
export class AdminTreeCategoryService {
  constructor(
    private readonly treeCategoryRepository: TreeCategoryRepository,
    private readonly drizzle: DrizzleService,
  ) {}

  async createCategory(payload: CreateCategoryDto) {
    return this.treeCategoryRepository.createCategory(
      payload as TNewTreeCategory,
    );
  }

  async getAllCategories(filter?: CategoryFilterDto) {
    const where = this.treeCategoryRepository['buildWhere'](filter);

    const categories = await this.drizzle.client
      .select({
        category: treeCategoryTable,
        icon: {
          id: mediaTable.id,
          url: mediaTable.url,
        },
      })
      .from(treeCategoryTable)
      .leftJoin(mediaTable, eq(mediaTable.id, treeCategoryTable.iconId))
      .where(and(...where))
      .execute();

    return categories.map((row) => ({
      ...row.category,
      icon: row.icon && row.icon.id ? row.icon : null,
    }));
  }

  async getCategoryById(id: string) {
    const [result] = await this.drizzle.client
      .select({
        category: treeCategoryTable,
        icon: {
          id: mediaTable.id,
          url: mediaTable.url,
        },
      })
      .from(treeCategoryTable)
      .leftJoin(mediaTable, eq(mediaTable.id, treeCategoryTable.iconId))
      .where(eq(treeCategoryTable.id, id))
      .execute();

    if (!result) {
      throw new NotFoundException('Category not found');
    }

    return {
      ...result.category,
      icon: result.icon && result.icon.id ? result.icon : null,
    };
  }

  async updateCategory(id: string, payload: UpdateCategoryDto) {
    const updatedCategory = await this.treeCategoryRepository.updateCategory(
      id,
      payload,
    );

    if (!updatedCategory) {
      throw new NotFoundException('Category not found');
    }
    return updatedCategory;
  }

  async softDeleteCategory(id: string) {
    const deletedCategory =
      await this.treeCategoryRepository.softDeleteCategory(id);

    if (!deletedCategory) {
      throw new NotFoundException('Category not found');
    }
    return deletedCategory;
  }
}
