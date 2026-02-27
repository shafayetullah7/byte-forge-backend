import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryQueryDto } from './dto/category-query.dto';
import { CategoryRepository } from '@/_repositories/library/taxonomy/category.repository';
import { CategoryHierarchyRepository } from '@/_repositories/library/taxonomy/category-hierarchy.repository';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { categoryHierarchyTable, categoriesTable, TNewCategory } from '@/_db/drizzle/schema/taxonomy';
import { eq, and, ne, sql, desc, isNull } from 'drizzle-orm';

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

      // Enforce Max 3 Levels Depth (Level 1: Root, Level 2: Child, Level 3: Grandchild)
      const depthCheck = await this.db.client
        .select({ depth: categoryHierarchyTable.depth })
        .from(categoryHierarchyTable)
        .where(eq(categoryHierarchyTable.descendantId, createCategoryDto.parentId))
        .orderBy(sql`${categoryHierarchyTable.depth} DESC`)
        .limit(1);

      const maxExistingDepth = depthCheck.length > 0 ? depthCheck[0].depth : 0;
      if (maxExistingDepth >= 2) {
        throw new BadRequestException("Category hierarchy cannot exceed 3 levels.");
      }
    }

    // Slug uniqueness pre-check for a fast, friendly error
    const existing = await this.categoryRepository.findBySlug(createCategoryDto.slug);
    if (existing) {
      throw new BadRequestException(`Category with slug '${createCategoryDto.slug}' already exists.`);
    }

    const { parentId, ...categoryPayload } = createCategoryDto;

    try {
      return await this.db.transaction(async (tx) => {
        const finalPayload: TNewCategory = {
          ...categoryPayload,
          isActive: categoryPayload.isActive ?? false,
          commissionRate: categoryPayload.commissionRate !== undefined
            ? categoryPayload.commissionRate.toString()
            : null,
        };

        // 1. Create the category
        const newCat = await this.categoryRepository.create(finalPayload, tx);

        // 2. Insert into hierarchy closure model
        await this.hierarchyRepository.insertNode(tx, parentId || null, newCat.id);

        return newCat;
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

    const [data, total] = await Promise.all([
      this.categoryRepository.findMany(query),
      this.categoryRepository.count(query)
    ]);

    // Enrich each flat row with parentId and depth from the hierarchy table
    const ids = data.map(c => c.id);
    let hierarchyMap = new Map<string, { parentId: string | null; depth: number }>();

    if (ids.length > 0) {
      // A single query to get parentId (depth=1 ancestor) and current depth (max depth row) per category
      const hierarchyRows = await this.db.client
        .select({
          id: categoryHierarchyTable.descendantId,
          ancestorId: categoryHierarchyTable.ancestorId,
          depth: categoryHierarchyTable.depth,
        })
        .from(categoryHierarchyTable)
        .where(
          sql`${categoryHierarchyTable.descendantId} = ANY(${sql.raw(`ARRAY[${ids.map(id => `'${id}'`).join(',')}]::uuid[]`)})`
        );

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

    const enriched = data.map(cat => ({
      ...cat,
      parentId: hierarchyMap.get(cat.id)?.parentId ?? null,
      depth: hierarchyMap.get(cat.id)?.depth ?? 0,
    }));

    return paginate(enriched, total, page, limit);
  }

  async getTree() {
    const allCategories = await this.db.client
      .select({
        id: categoriesTable.id,
        name: categoriesTable.name,
        slug: categoriesTable.slug,
        isActive: categoriesTable.isActive,
        parentId: sql<string | null>`(
          SELECT ancestor_id 
          FROM ${categoryHierarchyTable} 
          WHERE descendant_id = ${categoriesTable.id} AND depth = 1
        )`
      })
      .from(categoriesTable)
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

    categoryMap.forEach(node => {
      node.subCategoryCount = node.children.length;
    });

    return tree;
  }

  async findOne(id: string) {
    const category = await this.categoryRepository.findOne(id);
    if (!category) throw new NotFoundException(`Category ${id} not found.`);

    // 1. Get Parent Info
    const parent = await this.db.client
      .select({ id: categoriesTable.id, name: categoriesTable.name })
      .from(categoryHierarchyTable)
      .innerJoin(categoriesTable, eq(categoriesTable.id, categoryHierarchyTable.ancestorId))
      .where(and(
        eq(categoryHierarchyTable.descendantId, category.id),
        eq(categoryHierarchyTable.depth, 1)
      ))
      .limit(1);

    // 2. Get Children
    const childrenCountQuery = await this.db.client
      .select({
        id: categoriesTable.id,
        name: categoriesTable.name,
        slug: categoriesTable.slug,
        isActive: categoriesTable.isActive,
        subCategoryCount: sql<number>`(SELECT count(*) FROM ${categoryHierarchyTable} WHERE ancestor_id = ${categoriesTable.id} AND depth = 1)`
      })
      .from(categoryHierarchyTable)
      .innerJoin(categoriesTable, eq(categoriesTable.id, categoryHierarchyTable.descendantId))
      .where(and(
        eq(categoryHierarchyTable.ancestorId, category.id),
        eq(categoryHierarchyTable.depth, 1)
      ));

    // 3. Get depth info
    const depthQuery = await this.db.client
      .select({ depth: categoryHierarchyTable.depth })
      .from(categoryHierarchyTable)
      .where(eq(categoryHierarchyTable.descendantId, category.id))
      .orderBy(desc(categoryHierarchyTable.depth))
      .limit(1);

    const currentDepth = depthQuery.length > 0 ? depthQuery[0].depth : 0;

    // 4. Get Eligible Parent Options (depth < 2, not a descendant, not self)
    const descendants = await this.db.client
      .select({ id: categoryHierarchyTable.descendantId })
      .from(categoryHierarchyTable)
      .where(eq(categoryHierarchyTable.ancestorId, category.id));

    const descendantIds = descendants.map(d => d.id);

    const parentOptions = await this.db.client
      .select({ id: categoriesTable.id, name: categoriesTable.name })
      .from(categoriesTable)
      .innerJoin(categoryHierarchyTable, eq(categoryHierarchyTable.descendantId, categoriesTable.id))
      .where(and(
        // Exclude self and all descendants (prevents circular hierarchy)
        ne(categoriesTable.id, id),
        descendantIds.length > 0
          ? sql`${categoriesTable.id} NOT IN (${sql.join(descendantIds.map(did => sql`${did}`), sql`, `)})`
          : sql`TRUE`,
        isNull(categoriesTable.deletedAt)
      ))
      .groupBy(categoriesTable.id)
      .having(sql`MAX(${categoryHierarchyTable.depth}) < 2`);

    return {
      ...category,
      parentName: parent[0]?.name || null,
      parentId: parent[0]?.id || null,
      depth: currentDepth,
      children: childrenCountQuery,
      parentOptions,
    };
  }

  async getAncestors(id: string) {
    const category = await this.categoryRepository.findOne(id);
    if (!category) throw new NotFoundException(`Category ${id} not found.`);

    // Return all ancestors ordered from root → immediate parent (ascending depth means root first)
    const ancestors = await this.db.client
      .select({
        id: categoriesTable.id,
        name: categoriesTable.name,
        slug: categoriesTable.slug,
        depth: categoryHierarchyTable.depth,
      })
      .from(categoryHierarchyTable)
      .innerJoin(categoriesTable, eq(categoriesTable.id, categoryHierarchyTable.ancestorId))
      .where(and(
        eq(categoryHierarchyTable.descendantId, id),
        sql`${categoryHierarchyTable.depth} > 0`  // exclude self (depth=0)
      ))
      .orderBy(desc(categoryHierarchyTable.depth));  // highest depth = root, so desc gives root first

    return ancestors;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findOne(id);

    const { parentId, ...catData } = updateCategoryDto;

    // Slug uniqueness pre-check
    if (catData.slug && catData.slug !== category.slug) {
      const existing = await this.categoryRepository.findBySlug(catData.slug);
      if (existing) {
        throw new BadRequestException(`Category with slug '${catData.slug}' already exists.`);
      }
    }

    const payload: Partial<TNewCategory> = {
      ...catData,
      commissionRate: catData.commissionRate !== undefined
        ? catData.commissionRate.toString()
        : undefined,
    };

    try {
      return await this.db.transaction(async (tx) => {
        if (parentId !== undefined) {
          // Prevent Circular Reference
          if (parentId === id) throw new BadRequestException("A category cannot be its own parent.");

          if (parentId) {
            const parentExists = await this.categoryRepository.findOne(parentId);
            if (!parentExists) throw new BadRequestException(`Parent Category ${parentId} not found.`);

            // Check if new parent is actually a descendant of the current category
            const isDescendant = await this.db.client
              .select({ id: categoryHierarchyTable.descendantId })
              .from(categoryHierarchyTable)
              .where(and(
                eq(categoryHierarchyTable.ancestorId, id),
                eq(categoryHierarchyTable.descendantId, parentId)
              ));

            if (isDescendant.length > 0) {
              throw new BadRequestException("Cannot move a category under its own descendant (Circular Reference).");
            }

            // Depth Limit Check: (New Parent Depth) + 1 + (Current Subtree Height) <= 2
            const parentDepthQuery = await this.db.client
              .select({ depth: categoryHierarchyTable.depth })
              .from(categoryHierarchyTable)
              .where(eq(categoryHierarchyTable.descendantId, parentId))
              .orderBy(desc(categoryHierarchyTable.depth))
              .limit(1);

            const newParentDepth = parentDepthQuery.length > 0 ? parentDepthQuery[0].depth : 0;

            const subtreeHeightQuery = await this.db.client
              .select({ height: sql<number>`MAX(${categoryHierarchyTable.depth})` })
              .from(categoryHierarchyTable)
              .where(eq(categoryHierarchyTable.ancestorId, id));

            const subtreeHeight = subtreeHeightQuery[0]?.height || 0;

            if (newParentDepth + 1 + subtreeHeight > 2) {
              throw new BadRequestException("Relocation would exceed the 3-level hierarchy limit.");
            }
          }

          await this.hierarchyRepository.moveSubtree(tx, id, parentId || null);
        }

        if (Object.keys(payload).length > 0) {
          return await this.categoryRepository.update(id, payload, tx);
        }

        return category;
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
      // 1. Get all descendants from the hierarchy (includes self due to depth 0 closure)
      const descendants = await tx
        .select({
          id: categoriesTable.id,
          usageCount: categoriesTable.usageCount
        })
        .from(categoryHierarchyTable)
        .innerJoin(categoriesTable, eq(categoriesTable.id, categoryHierarchyTable.descendantId))
        .where(eq(categoryHierarchyTable.ancestorId, id));

      const hasUsage = descendants.some(d => d.usageCount > 0);
      if (hasUsage) {
        throw new BadRequestException("Cannot delete category or its subcategories. One or more items have products associated with them.");
      }

      const descendantIds = descendants.map(d => d.id);

      // 2. Soft delete all descendants — slug uses row id so no duplicate-slug collision in bulk
      if (descendantIds.length > 0) {
        for (const dId of descendantIds) {
          await this.categoryRepository.softDelete(dId, tx);
        }
      }

      // 3. Wipe the hierarchy records for the entire subtree
      await this.hierarchyRepository.deleteSubtree(tx, id);
    });
  }
}
