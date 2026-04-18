import { Injectable, NotFoundException } from '@nestjs/common';
import { ShopRepository } from '@/_repositories/business/shop.repository/shop.repository';
import { ShopStatusEnum } from '@/_db/drizzle/enum';
import { resolveTranslation } from '@/common/utils/resolve-translation.util';

@Injectable()
export class PublicShopService {
  constructor(private readonly shopRepository: ShopRepository) {}

  async getPublicShopBySlug(slug: string, lang: string) {
    const shop = await this.shopRepository.getShopBySlug(slug);

    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    // Only return active shops to public
    if (shop.status !== ShopStatusEnum.ACTIVE) {
      throw new NotFoundException('Shop not found');
    }

    const translation = resolveTranslation(shop.translations, lang);

    return {
      id: shop.id,
      slug: shop.slug,
      name: translation?.name ?? '',
      description: translation?.description ?? '',
      businessHours: translation?.businessHours ?? '',
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
