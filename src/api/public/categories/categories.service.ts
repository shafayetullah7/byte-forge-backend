import { Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import {
  categoriesTable,
  categoryTranslationsTable,
} from '@/_db/drizzle/schema/taxonomy';
import { categoryHierarchyTable } from '@/_db/drizzle/schema/taxonomy/category-hierarchy.schema';
import { and, eq, isNull, inArray, sql } from 'drizzle-orm';
import { resolveTranslation } from '@/common/utils/resolve-translation.util';

export interface PublicCategoryResponse {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  isActive: boolean;
  childrenCount: number;
  usageCount: number;
  parentId: string | null;
  translations: Array<{
    locale: string;
    name: string;
    description: string | null;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class PublicCategoriesService {
  constructor(private readonly db: DrizzleService) {}

  async findAll(lang: string = 'en'): Promise<PublicCategoryResponse[]> {
    const activeCategories = await this.db.client.query.categoriesTable.findMany({
      where: and(
        eq(categoriesTable.isActive, true),
        isNull(categoriesTable.deletedAt),
      ),
      with: {
        translations: true,
        parentHierarchies: {
          where: eq(categoryHierarchyTable.depth, 1),
          columns: { ancestorId: true },
        },
      },
      orderBy: (t, { asc }) => asc(t.slug),
    });

    return activeCategories.map((cat) => {
      const translation = resolveTranslation(cat.translations, lang);
      const parentId = cat.parentHierarchies[0]?.ancestorId ?? null;

      return {
        id: cat.id,
        slug: cat.slug,
        name: translation?.name ?? 'Unnamed Category',
        description: translation?.description ?? null,
        isActive: cat.isActive,
        childrenCount: cat.childrenCount,
        usageCount: cat.usageCount,
        parentId,
        translations: cat.translations.map((t) => ({
          locale: t.locale,
          name: t.name,
          description: t.description ?? null,
        })),
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt,
      };
    });
  }

  async findOne(id: string, lang: string = 'en'): Promise<PublicCategoryResponse> {
    const category = await this.db.client.query.categoriesTable.findFirst({
      where: and(
        eq(categoriesTable.id, id),
        isNull(categoriesTable.deletedAt),
      ),
      with: {
        translations: true,
        parentHierarchies: {
          where: eq(categoryHierarchyTable.depth, 1),
          columns: { ancestorId: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category ${id} not found.`);
    }

    const translation = resolveTranslation(category.translations, lang);
    const parentId = category.parentHierarchies[0]?.ancestorId ?? null;

    return {
      id: category.id,
      slug: category.slug,
      name: translation?.name ?? 'Unnamed Category',
      description: translation?.description ?? null,
      isActive: category.isActive,
      childrenCount: category.childrenCount,
      usageCount: category.usageCount,
      parentId,
      translations: category.translations.map((t) => ({
        locale: t.locale,
        name: t.name,
        description: t.description ?? null,
      })),
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  async getTree(lang: string = 'en') {
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
          eq(categoryTranslationsTable.locale, 'en'),
        ),
      )
      .where(and(eq(categoriesTable.isActive, true), isNull(categoriesTable.deletedAt)));

    const ids = allCategories.map((c) => c.id);
    const allTranslations =
      ids.length > 0
        ? await this.db.client
            .select()
            .from(categoryTranslationsTable)
            .where(inArray(categoryTranslationsTable.categoryId, ids))
        : [];

    const localizedCategories = allCategories.map((cat) => {
      const translations = allTranslations.filter(
        (t) => t.categoryId === cat.id,
      );
      const translation = resolveTranslation(translations, lang);
      return {
        id: cat.id,
        slug: cat.slug,
        name: translation?.name ?? cat.name,
        childrenCount: cat.childrenCount,
        parentId: cat.parentId,
      };
    });

    const categoryMap = new Map();
    const tree: any[] = [];

    localizedCategories.forEach((cat) => {
      categoryMap.set(cat.id, { ...cat, children: null });
    });

    localizedCategories.forEach((cat) => {
      const node = categoryMap.get(cat.id);
      if (cat.parentId) {
        const parent = categoryMap.get(cat.parentId);
        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(node);
        } else {
          tree.push(node);
        }
      } else {
        tree.push(node);
      }
    });

    const calculateTotalDescendants = (node: any): number => {
      if (!node.children || node.children.length === 0) {
        return 0;
      }
      let count = node.children.length;
      for (const child of node.children) {
        count += calculateTotalDescendants(child);
      }
      return count;
    };

    tree.forEach((root) => {
      root.childrenCount = calculateTotalDescendants(root);
    });

    console.log('🌳 CATEGORY TREE RESPONSE:', JSON.stringify(tree, null, 2));

    return tree;
  }
}
