import { Injectable, NotFoundException } from '@nestjs/common';
import { ShopRepository } from '@/_repositories/business/shop.repository/shop.repository';
import { ShopStorefrontRepository } from '@/_repositories/business/shop-storefront.repository/shop-storefront.repository';
import { ShopStatusEnum } from '@/_db/drizzle/enum';
import { resolveTranslation } from '@/common/utils/resolve-translation.util';
import { mapStorefrontListToStrings } from '@/common/utils/map-storefront-list.util';
import { GetShopCategoriesServedService } from './get-shop-categories-served.service';
import { ListPublicShopsService } from './list-public-shops.service';
import { ListPublicShopProductsService } from './list-public-shop-products.service';
import { PublicShopReviewsService } from './public-shop-reviews.service';
import { ListPublicShopsQueryDto } from '../dto/list-public-shops-query.dto';
import { ListPublicShopProductsQueryDto } from '../dto/list-public-shop-products-query.dto';
import { ListPublicShopReviewsQueryDto } from '../dto/list-public-shop-reviews-query.dto';

@Injectable()
export class PublicShopService {
  constructor(
    private readonly shopRepository: ShopRepository,
    private readonly shopStorefrontRepository: ShopStorefrontRepository,
    private readonly getShopCategoriesServedService: GetShopCategoriesServedService,
    private readonly listPublicShopsService: ListPublicShopsService,
    private readonly listPublicShopProductsService: ListPublicShopProductsService,
    private readonly publicShopReviewsService: PublicShopReviewsService,
  ) {}

  listShops(query: ListPublicShopsQueryDto, lang: string) {
    return this.listPublicShopsService.execute(query, lang);
  }

  listShopProducts(
    slug: string,
    query: ListPublicShopProductsQueryDto,
    lang: string,
  ) {
    return this.listPublicShopProductsService.execute(slug, query, lang);
  }

  getShopReviews(
    slug: string,
    query: ListPublicShopReviewsQueryDto,
    lang: string,
  ) {
    return this.publicShopReviewsService.getShopReviews(slug, query, lang);
  }

  async getPublicShopBySlug(slug: string, lang: string) {
    const shop = await this.shopRepository.getShopBySlug(slug);

    if (!shop || shop.status !== ShopStatusEnum.ACTIVE) {
      throw new NotFoundException('Shop not found');
    }

    const translation = resolveTranslation(shop.translations, lang);
    const addressTranslation = shop.shopAddressTable
      ? resolveTranslation(shop.shopAddressTable.translations ?? [], lang)
      : null;

    const metrics = await this.listPublicShopsService.getShopMetrics(shop.id);

    const [whyChooseUsItems, valuePointItems, categoriesServed] =
      await Promise.all([
        this.shopStorefrontRepository.listWhyChooseUs(shop.id),
        this.shopStorefrontRepository.listValuePoints(shop.id),
        this.getShopCategoriesServedService.execute(shop.id, lang),
      ]);

    return {
      id: shop.id,
      slug: shop.slug,
      name: translation?.name ?? '',
      tagline: translation?.tagline ?? null,
      description: translation?.description ?? '',
      businessHours: translation?.businessHours ?? '',
      about: translation?.about ?? translation?.description ?? '',
      sellerStory: translation?.sellerStory ?? null,
      brandMission: translation?.brandMission ?? null,
      whyChooseUs: mapStorefrontListToStrings(whyChooseUsItems, lang),
      values: mapStorefrontListToStrings(valuePointItems, lang),
      categoriesServed,
      division: addressTranslation?.division ?? null,
      city: addressTranslation?.district ?? null,
      isVerified: shop.isVerified,
      status: shop.status,
      primaryColor: shop.primaryColor,
      secondaryColor: shop.secondaryColor,
      accentColor: shop.accentColor,
      logo: shop.logo
        ? {
            id: shop.logo.id,
            url: shop.logo.url,
          }
        : null,
      banner: shop.banner
        ? {
            id: shop.banner.id,
            url: shop.banner.url,
          }
        : null,
      address: shop.shopAddressTable ?? null,
      createdAt: shop.createdAt.toISOString(),
      metrics,
    };
  }
}
