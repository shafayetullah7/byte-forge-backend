import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, asc, count, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import {
  mediaTable,
  productTranslationsTable,
  productsTable,
  productVariantsTable,
  shopTable,
  shopTranslationsTable,
} from '@/_db/drizzle/schema';
import { ProductStatusEnum, ShopStatusEnum } from '@/_db/drizzle/enum';
import { paginate } from '@/common/utils/pagination.util';
import {
  AdminProductsQueryDto,
  ArchiveProductDto,
} from './dto/admin-products-query.dto';
import {
  mapAdminProductDetail,
  mapAdminProductSummary,
} from './admin-products.mapper';

@Injectable()
export class AdminProductsService {
  constructor(private readonly db: DrizzleService) {}

  async listProducts(query: AdminProductsQueryDto, lang: string) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const offset = (page - 1) * limit;
    const isAsc = query.sortOrder === 'asc';

    const conditions = [
      eq(productsTable.productType, query.productType ?? 'plant'),
      query.shopId ? eq(productsTable.shopId, query.shopId) : undefined,
      query.status ? eq(productsTable.status, query.status) : undefined,
      query.search?.trim()
        ? or(
            ilike(productsTable.slug, `%${query.search.trim()}%`),
            sql`exists (
              select 1 from ${productTranslationsTable}
              where ${productTranslationsTable.productId} = ${productsTable.id}
              and ${productTranslationsTable.name} ilike ${`%${query.search.trim()}%`}
            )`,
          )
        : undefined,
    ].filter(Boolean);

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [{ total }] = await this.db.client
      .select({ total: count() })
      .from(productsTable)
      .where(whereClause);

    const rows = await this.db.client
      .select({
        id: productsTable.id,
        slug: productsTable.slug,
        status: productsTable.status,
        productType: productsTable.productType,
        createdAt: productsTable.createdAt,
        updatedAt: productsTable.updatedAt,
        thumbnailUrl: mediaTable.url,
        name: productTranslationsTable.name,
        price: productVariantsTable.price,
        inventoryCount: productVariantsTable.inventoryCount,
        shopId: shopTable.id,
        shopSlug: shopTable.slug,
        shopName: shopTranslationsTable.name,
        shopStatus: shopTable.status,
      })
      .from(productsTable)
      .innerJoin(shopTable, eq(shopTable.id, productsTable.shopId))
      .leftJoin(mediaTable, eq(mediaTable.id, productsTable.thumbnailId))
      .leftJoin(
        productTranslationsTable,
        and(
          eq(productTranslationsTable.productId, productsTable.id),
          eq(productTranslationsTable.locale, lang),
        ),
      )
      .leftJoin(
        shopTranslationsTable,
        and(
          eq(shopTranslationsTable.shopId, shopTable.id),
          eq(shopTranslationsTable.locale, lang),
        ),
      )
      .leftJoin(
        productVariantsTable,
        and(
          eq(productVariantsTable.productId, productsTable.id),
          eq(productVariantsTable.isBase, true),
        ),
      )
      .where(whereClause)
      .orderBy(
        query.sortBy === 'name'
          ? isAsc
            ? asc(productTranslationsTable.name)
            : desc(productTranslationsTable.name)
          : query.sortBy === 'price'
            ? isAsc
              ? asc(productVariantsTable.price)
              : desc(productVariantsTable.price)
            : query.sortBy === 'updatedAt'
              ? isAsc
                ? asc(productsTable.updatedAt)
                : desc(productsTable.updatedAt)
              : isAsc
                ? asc(productsTable.createdAt)
                : desc(productsTable.createdAt),
      )
      .limit(limit)
      .offset(offset);

    return paginate(
      rows.map((row) => mapAdminProductSummary(row)),
      total,
      page,
      limit,
    );
  }

  async getProduct(productId: string) {
    const product = await this.db.client.query.productsTable.findFirst({
      where: eq(productsTable.id, productId),
      with: {
        thumbnail: true,
        translations: true,
        variants: true,
        shop: {
          with: {
            translations: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const enTranslation = product.translations?.find((t) => t.locale === 'en');
    const shopEnName = product.shop?.translations?.find(
      (t) => t.locale === 'en',
    )?.name;

    const baseVariant =
      product.variants?.find((v) => v.isBase) ?? product.variants?.[0];

    return mapAdminProductDetail({
      id: product.id,
      slug: product.slug,
      status: product.status,
      productType: product.productType,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      thumbnailUrl: product.thumbnail?.url ?? null,
      name: enTranslation?.name ?? product.slug,
      shortDescription: enTranslation?.shortDescription ?? null,
      description: enTranslation?.description ?? null,
      price: baseVariant?.price ?? null,
      inventoryCount: baseVariant?.inventoryCount ?? 0,
      shopId: product.shopId,
      shopSlug: product.shop?.slug ?? '',
      shopName: shopEnName ?? product.shop?.slug ?? null,
      shopStatus: product.shop?.status ?? '',
      sku: baseVariant?.sku ?? null,
      translations: (product.translations ?? []).map((t) => ({
        locale: t.locale,
        name: t.name,
        shortDescription: t.shortDescription,
        description: t.description,
      })),
    });
  }

  async archiveProduct(productId: string, dto: ArchiveProductDto) {
    void dto;
    const product = await this.db.client.query.productsTable.findFirst({
      where: eq(productsTable.id, productId),
      columns: { id: true, status: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.status === ProductStatusEnum.ARCHIVED) {
      throw new BadRequestException('Product is already archived');
    }

    await this.db.client
      .update(productsTable)
      .set({
        status: ProductStatusEnum.ARCHIVED,
        updatedAt: new Date(),
      })
      .where(eq(productsTable.id, productId));

    return { message: 'Product archived successfully' };
  }

  async restoreProduct(productId: string) {
    const product = await this.db.client.query.productsTable.findFirst({
      where: eq(productsTable.id, productId),
      columns: { id: true, status: true, shopId: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.status !== ProductStatusEnum.ARCHIVED) {
      throw new BadRequestException('Only archived products can be restored');
    }

    const shop = await this.db.client.query.shopTable.findFirst({
      where: eq(shopTable.id, product.shopId),
      columns: { status: true },
    });

    if (!shop || shop.status !== ShopStatusEnum.ACTIVE) {
      throw new BadRequestException(
        'Product cannot be restored while its shop is not active',
      );
    }

    await this.db.client
      .update(productsTable)
      .set({
        status: ProductStatusEnum.ACTIVE,
        updatedAt: new Date(),
      })
      .where(eq(productsTable.id, productId));

    return { message: 'Product restored successfully' };
  }
}
