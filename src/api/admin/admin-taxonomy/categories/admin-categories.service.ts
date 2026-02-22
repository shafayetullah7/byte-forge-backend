import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryRepository } from '@/_repositories/library/taxonomy/category.repository';
import { CategoryHierarchyRepository } from '@/_repositories/library/taxonomy/category-hierarchy.repository';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { categoryHierarchyTable, categoriesTable } from '@/_db/drizzle/schema/taxonomy';
import { eq, and, sql } from 'drizzle-orm';

const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

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
        // If parent is at depth 2 (grandchild), we cannot add children to it (that would be depth 3 / 4th level)
        throw new BadRequestException("Category hierarchy cannot exceed 3 levels.");
      }
    }

    const { parentId, ...catData } = createCategoryDto;
    const slug = generateSlug(catData.name);

    return await this.db.transaction(async (tx) => {
      // 1. Create the category
      const newCat = await this.categoryRepository.create(tx, {
        ...catData,
        slug,
        isActive: catData.isActive ?? false,
      });

      // 2. Insert into hierarchy closure model
      await this.hierarchyRepository.insertNode(tx, parentId || null, newCat.id);

      return newCat;
    });
  }

  async findAll(query: any) {
    return this.categoryRepository.findMany(query);
  }

  async getTree() {
    // A query to reconstruct a nested JSON tree from the closure table.
    // For large catalogs, consider doing this in Postgres directly using recursive CTEs or json build object.
    // Given JS processing is fine for < 1000 items:
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
      .from(categoriesTable);

    // Build Map & Root Elements
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
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findOne(id);
    
    const { parentId, ...catData } = updateCategoryDto;
    const payload: any = { ...catData };

    if (payload.name && payload.name !== category.name) {
      payload.slug = generateSlug(payload.name);
    }

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
        }
        
        // Use the Move Subtree logic
        await this.hierarchyRepository.moveSubtree(tx, id, parentId || null);
      }

      if (Object.keys(payload).length > 0) {
        return await this.categoryRepository.update(tx, id, payload);
      }
      
      return category;
    });
  }

  async remove(id: string) {
    const category = await this.findOne(id);
    
    if (category.usageCount > 0) {
      throw new BadRequestException("Cannot delete category. It has products associated with it.");
    }

    return await this.db.transaction(async (tx) => {
       await this.hierarchyRepository.deleteSubtree(tx, id);
       await this.categoryRepository.softDelete(tx, id);
    });
  }
}
