import { Injectable } from '@nestjs/common';
import {
  and,
  asc,
  eq,
  exists,
  ilike,
  inArray,
  or,
} from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import {
  mediaTable,
  plantDetailsTable,
  productsTable,
  productTranslationsTable,
} from '@/_db/drizzle/schema';
import { shopTable, shopTranslationsTable } from '@/_db/drizzle/schema/shop';
import { ShopStatusEnum } from '@/_db/drizzle/enum';
import { resolveTranslation } from '@/libs/utils/resolve-translation.util';
import { CheckSellerSubscriptionQuery } from '@/modules/subscription/application/queries/check-seller-subscription.query';
import type { SearchSuggestQueryDto } from '../../controllers/dto/search-suggest-query.dto';
import {
  rankSearchSuggestItems,
  type SearchSuggestCandidate,
} from './search-suggest.ranking';

/** Per-leg fetch cap before merge (see BL-11). */
const INTERNAL_LEG_LIMIT = 15;

export type SearchSuggestItem = SearchSuggestCandidate;

export type SearchSuggestResult = {
  items: SearchSuggestItem[];
};

@Injectable()
export class SearchSuggestQuery {
  constructor(
    private readonly db: DrizzleService,
    private readonly checkSellerSubscription: CheckSellerSubscriptionQuery,
  ) {}

  async execute(
    dto: SearchSuggestQueryDto,
    lang: string = 'en',
  ): Promise<SearchSuggestResult> {
    const search = dto.q.trim();
    const limit = dto.limit ?? 20;

    const [plants, shops] = await Promise.all([
      this.fetchPlantCandidates(search, lang),
      this.fetchShopCandidates(search, lang),
    ]);

    const items = rankSearchSuggestItems(
      search,
      [...plants, ...shops],
      limit,
    );

    return { items };
  }

  /**
   * Keep text + visibility filters aligned with ListPublicPlantsQuery (catalog).
   */
  private async fetchPlantCandidates(
    search: string,
    lang: string,
  ): Promise<SearchSuggestCandidate[]> {
    const searchFilter = this.buildPlantTextSearchCondition(search);

    const baseWhere = and(
      eq(productsTable.productType, 'plant'),
      eq(productsTable.status, 'ACTIVE'),
      exists(
        this.db.client
          .select({ id: shopTable.id })
          .from(shopTable)
          .where(
            and(
              eq(shopTable.id, productsTable.shopId),
              eq(shopTable.status, 'ACTIVE'),
            ),
          ),
      ),
      searchFilter,
      this.checkSellerSubscription.shopHasActiveEntitlement(
        productsTable.shopId,
      ),
    );

    const rows = await this.db.client
      .select({
        slug: productsTable.slug,
        name: productTranslationsTable.name,
        thumbnailId: productsTable.thumbnailId,
        thumbnailUrl: mediaTable.url,
        shopName: shopTranslationsTable.name,
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
      .leftJoin(shopTable, eq(shopTable.id, productsTable.shopId))
      .leftJoin(
        shopTranslationsTable,
        and(
          eq(shopTranslationsTable.shopId, shopTable.id),
          eq(shopTranslationsTable.locale, lang),
        ),
      )
      .where(baseWhere)
      .orderBy(asc(productTranslationsTable.name))
      .limit(INTERNAL_LEG_LIMIT);

    return rows.map((row) => ({
      type: 'plant' as const,
      slug: row.slug,
      name: row.name ?? row.slug,
      subtitle: row.shopName ?? undefined,
      image:
        row.thumbnailId && row.thumbnailUrl
          ? { id: row.thumbnailId, url: row.thumbnailUrl }
          : null,
    }));
  }

  private buildPlantTextSearchCondition(search: string) {
    return or(
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
      exists(
        this.db.client
          .select({ id: plantDetailsTable.id })
          .from(plantDetailsTable)
          .where(
            and(
              eq(plantDetailsTable.productId, productsTable.id),
              or(
                ilike(plantDetailsTable.scientificName, `%${search}%`),
                ilike(plantDetailsTable.commonNames, `%${search}%`),
              ),
            ),
          ),
      ),
      exists(
        this.db.client
          .select({ id: productTranslationsTable.id })
          .from(productTranslationsTable)
          .where(
            and(
              eq(productTranslationsTable.productId, productsTable.id),
              ilike(productTranslationsTable.shortDescription, `%${search}%`),
            ),
          ),
      ),
    );
  }

  /**
   * Keep filters aligned with ListPublicShopsQuery (shop module).
   */
  private async fetchShopCandidates(
    search: string,
    lang: string,
  ): Promise<SearchSuggestCandidate[]> {
    const visibility = eq(shopTable.status, ShopStatusEnum.ACTIVE);

    const searchFilter = or(
      ilike(shopTable.slug, `%${search}%`),
      exists(
        this.db.client
          .select({ id: shopTranslationsTable.id })
          .from(shopTranslationsTable)
          .where(
            and(
              eq(shopTranslationsTable.shopId, shopTable.id),
              ilike(shopTranslationsTable.name, `%${search}%`),
            ),
          ),
      ),
    );

    const where = and(
      visibility,
      searchFilter,
      this.checkSellerSubscription.shopHasActiveEntitlement(shopTable.id),
    );

    // Relational findMany + correlated exists breaks SQL alias ("shops" vs shopTable).
    const idRows = await this.db.client
      .select({ id: shopTable.id })
      .from(shopTable)
      .where(where)
      .limit(INTERNAL_LEG_LIMIT);

    const shopIds = idRows.map((row) => row.id);
    if (shopIds.length === 0) {
      return [];
    }

    const shopsRaw = await this.db.client.query.shopTable.findMany({
      where: inArray(shopTable.id, shopIds),
      with: {
        translations: true,
        logo: true,
        shopAddressTable: {
          with: { translations: true },
        },
      },
    });

    const shopById = new Map(shopsRaw.map((shop) => [shop.id, shop]));
    const shops = shopIds
      .map((id) => shopById.get(id))
      .filter((shop): shop is NonNullable<typeof shop> => shop != null);

    return shops.map((shop) => {
      const translation = resolveTranslation(shop.translations, lang);
      const addressTranslation = shop.shopAddressTable
        ? resolveTranslation(shop.shopAddressTable.translations ?? [], lang)
        : null;
      const city = addressTranslation?.district ?? null;
      const tagline = translation?.tagline ?? null;

      return {
        type: 'shop' as const,
        slug: shop.slug,
        name: translation?.name ?? shop.slug,
        subtitle: city ?? tagline ?? undefined,
        image: shop.logo ? { id: shop.logo.id, url: shop.logo.url } : null,
      };
    });
  }
}
