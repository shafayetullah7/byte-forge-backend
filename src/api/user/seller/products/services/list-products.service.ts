import { Injectable, Logger } from '@nestjs/common';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import {
  productTranslationsTable,
  productVariantsTable,
  productsTable,
  mediaTable,
} from '@/_db/drizzle/schema';
import { paginate } from '@/common/utils/pagination.util';
import { ListProductsQueryDto } from '../dto/list-products-query.dto';
import { and, count, eq, exists, ilike, or, asc, desc } from 'drizzle-orm';

export type ProductListItem = {
  id: string;
  slug: string;
  productType: string;
  status: string;
  thumbnail: { id: string; url: string } | null;
  name: string | null;
  shortDescription: string | null;
  price: string | null;
  inventoryCount: number;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class ListProductsService {
  private readonly logger = new Logger(ListProductsService.name);

  constructor(private readonly db: DrizzleService) {}

  async execute(
    shopId: string,
    query: ListProductsQueryDto,
    lang: string = 'en',
  ) {
    try {
      const { page, limit, search, productType, status, sortBy, sortOrder } =
        query;
      const offset = (page - 1) * limit;
      const isAsc = sortOrder === 'asc';

      const where = and(
        eq(productsTable.shopId, shopId),
        productType ? eq(productsTable.productType, productType) : undefined,
        status ? eq(productsTable.status, status) : undefined,
        search
          ? or(
              ilike(productsTable.slug, `%${search}%`),
              exists(
                this.db.client
                  .select({ id: productTranslationsTable.id })
                  .from(productTranslationsTable)
                  .where(
                    and(
                      eq(productTranslationsTable.productId, productsTable.id),
                      ilike(productTranslationsTable.name, `%${search}%`),
                    ),
                  ),
              ),
            )
          : undefined,
      );

      const [{ total }] = await this.db.client
        .select({ total: count() })
        .from(productsTable)
        .where(where)
        .execute();

      const rows = await this.db.client
        .select({
          productId: productsTable.id,
          slug: productsTable.slug,
          productType: productsTable.productType,
          status: productsTable.status,
          thumbnailId: productsTable.thumbnailId,
          thumbnailUrl: mediaTable.url,
          name: productTranslationsTable.name,
          shortDescription: productTranslationsTable.shortDescription,
          price: productVariantsTable.price,
          inventoryCount: productVariantsTable.inventoryCount,
          createdAt: productsTable.createdAt,
          updatedAt: productsTable.updatedAt,
        })
        .from(productsTable)
        .leftJoin(mediaTable, eq(mediaTable.id, productsTable.thumbnailId))
        .leftJoin(
          productTranslationsTable,
          and(
            eq(productTranslationsTable.productId, productsTable.id),
            eq(productTranslationsTable.locale, lang),
          ),
        )
        .leftJoin(
          productVariantsTable,
          and(
            eq(productVariantsTable.productId, productsTable.id),
            eq(productVariantsTable.isBase, true),
          ),
        )
        .where(where)
        .orderBy(() => {
          switch (sortBy) {
            case 'name':
              return isAsc
                ? asc(productTranslationsTable.name)
                : desc(productTranslationsTable.name);
            case 'price':
              return isAsc
                ? asc(productVariantsTable.price)
                : desc(productVariantsTable.price);
            case 'inventory':
              return isAsc
                ? asc(productVariantsTable.inventoryCount)
                : desc(productVariantsTable.inventoryCount);
            case 'updatedAt':
              return isAsc
                ? asc(productsTable.updatedAt)
                : desc(productsTable.updatedAt);
            case 'createdAt':
            default:
              return isAsc
                ? asc(productsTable.createdAt)
                : desc(productsTable.createdAt);
          }
        })
        .limit(limit)
        .offset(offset);

      const result: ProductListItem[] = rows.map((row) => ({
        id: row.productId,
        slug: row.slug,
        productType: row.productType,
        status: row.status,
        thumbnail:
          row.thumbnailId && row.thumbnailUrl
            ? { id: row.thumbnailId, url: row.thumbnailUrl }
            : null,
        name: row.name ?? null,
        shortDescription: row.shortDescription ?? null,
        price: row.price ?? null,
        inventoryCount: row.inventoryCount ?? 0,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }));

      return paginate(result, Number(total), page, limit);
    } catch (error) {
      this.logger.error(
        `Failed to fetch products for shop ${shopId}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
