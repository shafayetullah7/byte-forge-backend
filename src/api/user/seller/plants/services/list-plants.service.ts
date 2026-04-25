import { Injectable } from '@nestjs/common';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { productsTable, productVariantsTable } from '@/_db/drizzle/schema';
import { paginate } from '@/common/utils/pagination.util';
import { ListPlantsQueryDto } from '../dto/list-plants-query.dto';
import { and, count, eq, ilike, or, sql } from 'drizzle-orm';

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

    const baseWhere = and(
      eq(productsTable.shopId, shopId),
      eq(productsTable.productType, 'plant'),
      status ? eq(productsTable.status, status) : undefined,
      categoryId ? eq(productsTable.categoryId, categoryId) : undefined,
      search
        ? or(
            ilike(productsTable.slug, `%${search}%`),
            sql`${productsTable.id} IN (
              SELECT "product_id" FROM "product_translations"
              WHERE LOWER("name") LIKE LOWER(${`%${search}%`})
            )`,
          )
        : undefined,
    );

    const tagWhere =
      tagIds && tagIds.length > 0
        ? sql`${productsTable.id} IN (
            SELECT "product_id" FROM "product_tags"
            WHERE "tag_id" = ANY(${tagIds}::uuid[])
          )`
        : undefined;

    const fullWhere = tagWhere ? and(baseWhere, tagWhere) : baseWhere;

    const [{ total }] = await this.db.client
      .select({ total: count() })
      .from(productsTable)
      .where(fullWhere)
      .execute();

    const dbSortColumn =
      sortBy === 'updatedAt'
        ? productsTable.updatedAt
        : productsTable.createdAt;
    const orderFn = sortOrder === 'asc' ? 'asc' : 'desc';

    const products = await this.db.client.query.productsTable.findMany({
      where: fullWhere,
      with: {
        category: {
          columns: { id: true, slug: true },
          with: {
            translations: { columns: { locale: true, name: true } },
          },
        },
        translations: {
          columns: { locale: true, name: true, shortDescription: true },
        },
      },
      limit,
      offset,
      orderBy: (t, { asc, desc }) =>
        orderFn === 'asc' ? asc(dbSortColumn) : desc(dbSortColumn),
    });

    const productIds = products.map((p) => p.id);

    const baseVariants =
      productIds.length > 0
        ? await this.db.client.query.productVariantsTable.findMany({
            where: and(
              eq(productVariantsTable.isBase, true),
              sql`${productVariantsTable.productId} = ANY(${productIds}::uuid[])`,
            ),
            columns: {
              productId: true,
              price: true,
              salePrice: true,
              inventoryCount: true,
            },
          })
        : [];

    const variantMap = new Map<
      string,
      (typeof baseVariants)[number]
    >(baseVariants.map((v) => [v.productId, v]));

    const enrichedData = products.map((p) => {
      const trans = p.translations.find((t) => t.locale === locale);
      const variant = variantMap.get(p.id);
      const catTrans = p.category?.translations?.find(
        (t) => t.locale === locale,
      );

      return {
        id: p.id,
        slug: p.slug,
        status: p.status,
        thumbnailId: p.thumbnailId,
        name: trans?.name,
        shortDescription: trans?.shortDescription,
        price: variant?.price ? parseFloat(variant.price) : null,
        salePrice: variant?.salePrice
          ? parseFloat(variant.salePrice)
          : null,
        inventoryCount: variant?.inventoryCount ?? 0,
        category: p.category
          ? {
              id: p.category.id,
              slug: p.category.slug,
              name: catTrans?.name,
            }
          : null,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };
    });

    if (sortBy === 'name') {
      const sortFn = sortOrder === 'asc' ? 1 : -1;
      enrichedData.sort((a, b) => {
        const nameA = a.name || '';
        const nameB = b.name || '';
        return nameA.localeCompare(nameB) * sortFn;
      });
    } else if (sortBy === 'price' || sortBy === 'inventory') {
      const sortFn = sortOrder === 'asc' ? 1 : -1;
      enrichedData.sort((a, b) => {
        const valA =
          sortBy === 'price' ? a.price ?? -1 : a.inventoryCount;
        const valB =
          sortBy === 'price' ? b.price ?? -1 : b.inventoryCount;
        if (valA < valB) return -1 * sortFn;
        if (valA > valB) return 1 * sortFn;
        return 0;
      });
    }

    return paginate(enrichedData, Number(total), page, limit);
  }
}
