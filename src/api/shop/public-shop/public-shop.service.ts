import { Injectable, NotFoundException } from '@nestjs/common';
import { ShopRepository } from '@/_repositories/business/shop.repository/shop.repository';
import { ShopStatusEnum } from '@/_db/drizzle/enum';

@Injectable()
export class PublicShopService {
  constructor(private readonly shopRepository: ShopRepository) {}

  async getPublicShopBySlug(slug: string) {
    const shop = await this.shopRepository.getShopBySlug(slug);

    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    // Only return active shops to public
    if (shop.status !== ShopStatusEnum.ACTIVE) {
      throw new NotFoundException('Shop not found');
    }

    // Filter translations to get English version as default, fallback to first
    const translations = shop.translations ?? [];
    const defaultTranslation =
      translations.find((t) => t.locale === 'en') || translations[0];

    return {
      id: shop.id,
      slug: shop.slug,
      shopName: defaultTranslation?.shopName ?? '',
      about: defaultTranslation?.about ?? '',
      brandStory: defaultTranslation?.brandStory ?? '',
      featuredHighlight: defaultTranslation?.featuredHighlight ?? '',
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
      createdAt: shop.createdAt,
    };
  }
}
