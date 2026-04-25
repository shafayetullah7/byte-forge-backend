import { Injectable } from '@nestjs/common';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { productsTable, productVariantsTable } from '@/_db/drizzle/schema';
import { paginate } from '@/common/utils/pagination.util';
import { ListPlantsQueryDto } from '../dto/list-plants-query.dto';
import { and, count, eq } from 'drizzle-orm';

@Injectable()
export class ListPlantsService {
  constructor(private readonly db: DrizzleService) {}

  async execute(shopId: string, query: ListPlantsQueryDto) {
    const {
      page,
      limit,
      search,
      status,
      categoryId,
      tagIds,
      locale,
      sortBy,
      sortOrder,
    } = query;
    const offset = (page - 1) * limit;

    // Build where clause safely (inline conditions prevent TS inference bugs)
    const whereClause = and(
      eq(productsTable.shopId, shopId),
      eq(productsTable.productType, 'plant'),
      status ? eq(productsTable.status, status) : undefined,
      categoryId ? eq(productsTable.categoryId, categoryId) : undefined
    );

    const orderFn = sortOrder === 'asc' ? 'asc' : 'desc';
    const dbSortColumn =
      sortBy === 'updatedAt' ? productsTable.updatedAt : productsTable.createdAt;

    // Fetch products with relations using Drizzle Query Builder
    const products = await this.db.client.query.productsTable.findMany({
      where: whereClause,
      with: {
        translations: { columns: { locale: true, name: true, shortDescription: true } },
        tags: {
          with: {
            tag: {
              with: { translations: { columns: { locale: true, name: true } } },
              columns: { id: true },
            },
          },
          columns: {},
        },
      },
      limit,
      offset,
      orderBy: (t, { asc, desc }) =>
        orderFn === 'asc' ? asc(dbSortColumn) : desc(dbSortColumn),
    });

    // Fetch base variants separately to avoid type conflicts & Cartesian explosion
    const productIds = products.map((p) => p.id);
    const variants = await this.db.client.query.productVariantsTable.findMany({
      where: (v, { eq, and, inArray }) =>
        and(inArray(v.productId, productIds), eq(v.isBase, true)),
      columns: { productId: true, price: true, inventoryCount: true },
    });
    const variantMap = new Map(variants.map((v) => [v.productId, v]));

    // Enrich & Transform data
    const enrichedData = products.map((p) => {
      const trans = p.translations.find((t) => t.locale === locale);
      const variant = variantMap.get(p.id);
      return {
        id: p.id,
        slug: p.slug,
        status: p.status,
        thumbnailId: p.thumbnailId,
        name: trans?.name,
        shortDescription: trans?.shortDescription,
        price: variant?.price ? parseFloat(variant.price) : null,
        inventoryCount: variant?.inventoryCount ?? 0,
        categoryId: p.categoryId,
        categoryName: null, // Category name requires joining translations table separately
        tags: p.tags.map((pt) => {
          const tagTrans = pt.tag.translations.find((t) => t.locale === locale);
          return { id: pt.tag.id, name: tagTrans?.name };
        }),
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };
    });

    // In-memory sorting for child columns (name, price, inventory)
    const sortFn = sortOrder === 'asc' ? 1 : -1;
    enrichedData.sort((a, b) => {
      let valA: any, valB: any;
      switch (sortBy) {
        case 'name':
          valA = a.name || '';
          valB = b.name || '';
          break;
        case 'price':
          valA = a.price ?? -1;
          valB = b.price ?? -1;
          break;
        case 'inventory':
          valA = a.inventoryCount;
          valB = b.inventoryCount;
          break;
        case 'updatedAt':
          valA = a.updatedAt;
          valB = b.updatedAt;
          break;
        default:
          valA = a.createdAt;
          valB = b.createdAt;
      }
      if (valA < valB) return -1 * sortFn;
      if (valA > valB) return 1 * sortFn;
      return 0;
    });

    // In-memory search filter
    const filteredData = search
      ? enrichedData.filter(
          (p) =>
            p.name?.toLowerCase().includes(search.toLowerCase()) ||
            p.slug.toLowerCase().includes(search.toLowerCase())
        )
      : enrichedData;

    // In-memory tag filter
    const tagFilteredData =
      tagIds && tagIds.length > 0
        ? filteredData.filter((p) =>
            tagIds.some((tagId) => p.tags.some((t) => t.id === tagId))
          )
        : filteredData;

    // Apply pagination slice after sorting/filtering
    const paginatedData = tagFilteredData.slice(offset, offset + limit);

    // Count total (approximate when search/tagIds are used, exact for main filters)
    const [{ total }] = await this.db.client
      .select({ total: count() })
      .from(productsTable)
      .where(whereClause)
      .execute();

    return paginate(paginatedData, Number(total), page, limit);
  }
}
