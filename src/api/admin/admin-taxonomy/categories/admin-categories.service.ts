import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryQueryDto } from './dto/category-query.dto';
import { CategoryRepository } from '@/_repositories/library/taxonomy/category.repository';
import { CategoryHierarchyRepository } from '@/_repositories/library/taxonomy/category-hierarchy.repository';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { categoryHierarchyTable, categoriesTable, TNewCategory, categoryTranslationsTable } from '@/_db/drizzle/schema/taxonomy';
import { eq, and, ne, sql, desc, isNull, gt, inArray, notInArray, count, asc, ilike, SQL, getTableColumns } from 'drizzle-orm';

import { paginate } from '@/common/utils/pagination.util';

@Injectable()
export class AdminCategoriesService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly hierarchyRepository: CategoryHierarchyRepository,
    private readonly db: DrizzleService,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    if (createCategoryDto.parentId) {
      const parent = await this.categoryRepository.findOne(createCategoryDto.parentId);
      if (!parent) throw new BadRequestException(`Parent Category ${createCategoryDto.parentId} not found.`);

      const depthCheck = await this.db.client
        .select({ depth: categoryHierarchyTable.depth })
        .from(categoryHierarchyTable)
        .where(eq(categoryHierarchyTable.descendantId, createCategoryDto.parentId))
        .orderBy(desc(categoryHierarchyTable.depth))
        .limit(1);

      const maxExistingDepth = depthCheck.length > 0 ? depthCheck[0].depth : 0;
      if (maxExistingDepth >= 2) {
        throw new BadRequestException("Category hierarchy cannot exceed 3 levels.");
      }
    }

    const existing = await this.categoryRepository.findBySlug(createCategoryDto.slug);
    if (existing) {
      throw new BadRequestException(`Category with slug '${createCategoryDto.slug}' already exists.`);
    }

    const { parentId, translations, ...categoryPayload } = createCategoryDto;
    const baseEnglishName = translations.find(t => t.locale === 'en')?.name;

    if (!baseEnglishName) {
      throw new BadRequestException("Base English translation is required.");
    }

    try {
      return await this.db.transaction(async (tx) => {
        const finalPayload: TNewCategory = {
          ...categoryPayload,
          isActive: categoryPayload.isActive ?? false,
          commissionRate: categoryPayload.commissionRate !== undefined
            ? categoryPayload.commissionRate.toString()
            : null,
        };

        const newCat = await this.categoryRepository.create(finalPayload, tx);

        await tx.insert(categoryTranslationsTable).values(
          translations.map(t => ({
            ...t,
            categoryId: newCat.id,
          }))
        );

        await this.hierarchyRepository.insertNode(tx, parentId || null, newCat.id);

        if (parentId) {
          await this.categoryRepository.incrementChildrenCount(parentId, 1, tx);
        }

        return { ...newCat, name: baseEnglishName, translations };
      });
    } catch (error: any) {
      if (error.code === '23505') {
        throw new BadRequestException(`Category with slug '${createCategoryDto.slug}' already exists.`);
      }
      throw error;
    }
  }

  async findAll(query: CategoryQueryDto) {
    const limit = query.limit ? Number(query.limit) : 20;
    const page = query.page ? Number(query.page) : 1;
    const offset = (page - 1) * limit;

    const where: SQL[] = [isNull(categoriesTable.deletedAt)];
    if (query.isActive !== undefined) {
      where.push(eq(categoriesTable.isActive, query.isActive === 'true'));
    }
    
    // Search within English translations if searching by name
    const whereClause = and(...where);

    const sortByField =
      query.sortBy === 'updatedAt' ? categoriesTable.updatedAt :
      categoriesTable.createdAt;
    const sortFn = query.sortOrder === 'asc' ? asc : desc;

    const [data, [{ total }]] = await Promise.all([
      this.db.client
        .select({
          ...getTableColumns(categoriesTable),
          name: sql<string>`COALESCE(${categoryTranslationsTable.name}, 'Unnamed Category')`,
          description: categoryTranslationsTable.description,
        })
        .from(categoriesTable)
        .leftJoin(
          categoryTranslationsTable,
          and(
            eq(categoryTranslationsTable.categoryId, categoriesTable.id),
            eq(categoryTranslationsTable.locale, 'en')
          )
        )
        .where(whereClause)
        .orderBy(sortFn(sortByField))
        .limit(limit)
        .offset(offset),
      this.db.client
        .select({ total: count() })
        .from(categoriesTable)
        .leftJoin(
          categoryTranslationsTable,
          and(
            eq(categoryTranslationsTable.categoryId, categoriesTable.id),
            eq(categoryTranslationsTable.locale, 'en')
          )
        )
        .where(whereClause),
    ]);

    const ids = data.map(c => c.id);
    const hierarchyMap = new Map<string, { parentId: string | null; depth: number }>();

    if (ids.length > 0) {
      const hierarchyRows = await this.db.client
        .select({
          id: categoryHierarchyTable.descendantId,
          ancestorId: categoryHierarchyTable.ancestorId,
          depth: categoryHierarchyTable.depth,
        })
        .from(categoryHierarchyTable)
        .where(inArray(categoryHierarchyTable.descendantId, ids));

      ids.forEach(id => {
        const rows = hierarchyRows.filter(r => r.id === id);
        const maxDepth = Math.max(...rows.map(r => r.depth));
        const parentRow = rows.find(r => r.depth === 1);
        hierarchyMap.set(id, {
          parentId: parentRow?.ancestorId ?? null,
          depth: maxDepth,
        });
      });
    }

    const allTranslations = ids.length > 0 ? await this.db.client
      .select()
      .from(categoryTranslationsTable)
      .where(inArray(categoryTranslationsTable.categoryId, ids)) : [];

    const enriched = data.map(cat => ({
      ...cat,
      parentId: hierarchyMap.get(cat.id)?.parentId ?? null,
      depth: hierarchyMap.get(cat.id)?.depth ?? 0,
      translations: allTranslations.filter(t => t.categoryId === cat.id),
    }));

    return paginate(enriched, total, page, limit);
  }

  async getTree() {
    const allCategories = await this.db.client
      .select({
        id: categoriesTable.id,
        name: sql<string>`COALESCE(${categoryTranslationsTable.name}, 'Unnamed Category')`,
        slug: categoriesTable.slug,
        isActive: categoriesTable.isActive,
        childrenCount: categoriesTable.childrenCount,
        parentId: sql<string | null>`(
          SELECT ancestor_id
          FROM ${categoryHierarchyTable}
          WHERE descendant_id = ${categoriesTable.id} AND depth = 1
        )`,
      })
      .from(categoriesTable)
      .leftJoin(
        categoryTranslationsTable,
        and(
          eq(categoryTranslationsTable.categoryId, categoriesTable.id),
          eq(categoryTranslationsTable.locale, 'en')
        )
      )
      .where(isNull(categoriesTable.deletedAt));

    const categoryMap = new Map();
    const tree: any[] = [];

    allCategories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    allCategories.forEach(cat => {
      const node = categoryMap.get(cat.id);
      if (cat.parentId) {
        const parent = categoryMap.get(cat.parentId);
        if (parent) parent.children.push(node);
      } else {
        tree.push(node);
      }
    });

    return tree;
  }

  async findOne(id: string) {
    const category = await this.categoryRepository.findOne(id);
    if (!category) throw new NotFoundException(`Category ${id} not found.`);

    const parent = await this.db.client
      .select({
        id: categoriesTable.id,
        name: sql<string>`COALESCE(${categoryTranslationsTable.name}, 'Unnamed Category')`,
      })
      .from(categoryHierarchyTable)
      .innerJoin(categoriesTable, eq(categoriesTable.id, categoryHierarchyTable.ancestorId))
      .leftJoin(
        categoryTranslationsTable,
        and(
          eq(categoryTranslationsTable.categoryId, categoriesTable.id),
          eq(categoryTranslationsTable.locale, 'en')
        )
      )
      .where(and(
        eq(categoryHierarchyTable.descendantId, category.id),
        eq(categoryHierarchyTable.depth, 1)
      ))
      .limit(1);

    const childrenCountQuery = await this.db.client
      .select({
        id: categoriesTable.id,
        name: sql<string>`COALESCE(${categoryTranslationsTable.name}, 'Unnamed Category')`,
        slug: categoriesTable.slug,
        isActive: categoriesTable.isActive,
        childrenCount: categoriesTable.childrenCount,
      })
      .from(categoryHierarchyTable)
      .innerJoin(categoriesTable, eq(categoriesTable.id, categoryHierarchyTable.descendantId))
      .leftJoin(
        categoryTranslationsTable,
        and(
          eq(categoryTranslationsTable.categoryId, categoriesTable.id),
          eq(categoryTranslationsTable.locale, 'en')
        )
      )
      .where(and(
        eq(categoryHierarchyTable.ancestorId, category.id),
        eq(categoryHierarchyTable.depth, 1)
      ));

    const depthQuery = await this.db.client
      .select({ depth: categoryHierarchyTable.depth })
      .from(categoryHierarchyTable)
      .where(eq(categoryHierarchyTable.descendantId, category.id))
      .orderBy(desc(categoryHierarchyTable.depth))
      .limit(1);

    const currentDepth = depthQuery.length > 0 ? depthQuery[0].depth : 0;

    const descendants = await this.db.client
      .select({ id: categoryHierarchyTable.descendantId })
      .from(categoryHierarchyTable)
      .where(eq(categoryHierarchyTable.ancestorId, category.id));

    const descendantIds = descendants.map(d => d.id);

    const parentOptions = await this.db.client
      .select({
        id: categoriesTable.id,
        name: sql<string>`COALESCE(${categoryTranslationsTable.name}, 'Unnamed Category')`
      })
      .from(categoriesTable)
      .innerJoin(categoryHierarchyTable, eq(categoryHierarchyTable.descendantId, categoriesTable.id))
      .leftJoin(
        categoryTranslationsTable,
        and(
          eq(categoryTranslationsTable.categoryId, categoriesTable.id),
          eq(categoryTranslationsTable.locale, 'en')
        )
      )
      .where(and(
        ne(categoriesTable.id, id),
        descendantIds.length > 0
          ? notInArray(categoriesTable.id, descendantIds)
          : sql`TRUE`,
        isNull(categoriesTable.deletedAt)
      ))
      .groupBy(categoriesTable.id, categoryTranslationsTable.name)
      .having(sql`MAX(${categoryHierarchyTable.depth}) < 2`);

    const translations = await this.db.client
      .select()
      .from(categoryTranslationsTable)
      .where(eq(categoryTranslationsTable.categoryId, category.id));

    return {
      ...category,
      name: translations.find(t => t.locale === 'en')?.name || 'Unnamed Category',
      parentName: parent[0]?.name || null,
      parentId: parent[0]?.id || null,
      depth: currentDepth,
      children: childrenCountQuery,
      parentOptions,
      translations,
    };
  }

  async getAncestors(id: string) {
    const category = await this.categoryRepository.findOne(id);
    if (!category) throw new NotFoundException(`Category ${id} not found.`);

    const ancestors = await this.db.client
      .select({
        id: categoriesTable.id,
        name: sql<string>`COALESCE(${categoryTranslationsTable.name}, 'Unnamed Category')`,
        slug: categoriesTable.slug,
        depth: categoryHierarchyTable.depth,
      })
      .from(categoryHierarchyTable)
      .innerJoin(categoriesTable, eq(categoriesTable.id, categoryHierarchyTable.ancestorId))
      .leftJoin(
        categoryTranslationsTable,
        and(
          eq(categoryTranslationsTable.categoryId, categoriesTable.id),
          eq(categoryTranslationsTable.locale, 'en')
        )
      )
      .where(and(
        eq(categoryHierarchyTable.descendantId, id),
        gt(categoryHierarchyTable.depth, 0)
      ))
      .orderBy(desc(categoryHierarchyTable.depth));

    return ancestors;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id);

    const { parentId, translations, ...catData } = updateCategoryDto;

    const payload: Partial<TNewCategory> = {
      ...catData,
      commissionRate: catData.commissionRate !== undefined
        ? catData.commissionRate.toString()
        : undefined,
    };

    try {
      return await this.db.transaction(async (tx) => {
        if (parentId !== undefined) {
          if (parentId === id) throw new BadRequestException("A category cannot be its own parent.");

          const oldParentRow = await tx
            .select({ ancestorId: categoryHierarchyTable.ancestorId })
            .from(categoryHierarchyTable)
            .where(and(
              eq(categoryHierarchyTable.descendantId, id),
              eq(categoryHierarchyTable.depth, 1)
            ))
            .for('update')
            .limit(1);
          const oldParentId = oldParentRow[0]?.ancestorId ?? null;

          if (parentId) {
            const parentExists = await this.categoryRepository.findOne(parentId);
            if (!parentExists) throw new BadRequestException(`Parent Category ${parentId} not found.`);

            const isDescendant = await tx
              .select({ id: categoryHierarchyTable.descendantId })
              .from(categoryHierarchyTable)
              .where(and(
                eq(categoryHierarchyTable.ancestorId, id),
                eq(categoryHierarchyTable.descendantId, parentId)
              ));

            if (isDescendant.length > 0) {
              throw new BadRequestException("Cannot move a category under its own descendant (Circular Reference).");
            }

            const parentDepthQuery = await tx
              .select({ depth: categoryHierarchyTable.depth })
              .from(categoryHierarchyTable)
              .where(eq(categoryHierarchyTable.descendantId, parentId))
              .orderBy(desc(categoryHierarchyTable.depth))
              .limit(1);

            const newParentDepth = parentDepthQuery.length > 0 ? parentDepthQuery[0].depth : 0;

            const subtreeHeightQuery = await tx
              .select({ height: sql<number>`MAX(${categoryHierarchyTable.depth})` })
              .from(categoryHierarchyTable)
              .where(eq(categoryHierarchyTable.ancestorId, id));

            const subtreeHeight = subtreeHeightQuery[0]?.height || 0;

            if (newParentDepth + 1 + subtreeHeight > 2) {
              throw new BadRequestException("Relocation would exceed the 3-level hierarchy limit.");
            }
          }

          await this.hierarchyRepository.moveSubtree(tx, id, parentId || null);

          if (oldParentId !== parentId) {
            if (oldParentId) {
              await this.categoryRepository.decrementChildrenCount(oldParentId, 1, tx);
            }
            if (parentId) {
              await this.categoryRepository.incrementChildrenCount(parentId, 1, tx);
            }
          }
        }

        if (translations && translations.length > 0) {
          for (const t of translations) {
            await tx
              .insert(categoryTranslationsTable)
              .values({
                ...t,
                categoryId: id,
              })
              .onConflictDoUpdate({
                target: [categoryTranslationsTable.categoryId, categoryTranslationsTable.locale],
                set: { 
                  name: t.name, 
                  description: t.description 
                },
              });
          }
        }

        if (Object.keys(payload).length > 0) {
          await this.categoryRepository.update(id, payload, tx);
        }

        return this.findOne(id);
      });
    } catch (error: any) {
      if (error.code === '23505') {
        throw new BadRequestException(`Category with slug '${catData.slug}' already exists.`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    await this.findOne(id);

    return await this.db.transaction(async (tx) => {
      const parentRow = await tx
        .select({ ancestorId: categoryHierarchyTable.ancestorId })
        .from(categoryHierarchyTable)
        .where(and(
          eq(categoryHierarchyTable.descendantId, id),
          eq(categoryHierarchyTable.depth, 1)
        ))
        .for('update')
        .limit(1);
      const immediateParentId = parentRow[0]?.ancestorId ?? null;

      const descendants = await tx
        .select({
          id: categoriesTable.id,
          usageCount: categoriesTable.usageCount,
        })
        .from(categoryHierarchyTable)
        .innerJoin(categoriesTable, eq(categoriesTable.id, categoryHierarchyTable.descendantId))
        .where(eq(categoryHierarchyTable.ancestorId, id));

      const hasUsage = descendants.some(d => d.usageCount > 0);
      if (hasUsage) {
        throw new BadRequestException("Cannot delete category or its subcategories. One or more items have products associated with them.");
      }

      const descendantIds = descendants.map(d => d.id);

      if (descendantIds.length > 0) {
        for (const dId of descendantIds) {
          await this.categoryRepository.softDelete(dId, tx);
        }
      }

      await this.hierarchyRepository.deleteSubtree(tx, id);

      if (immediateParentId) {
        await this.categoryRepository.decrementChildrenCount(immediateParentId, 1, tx);
      }
    });
  }
}
