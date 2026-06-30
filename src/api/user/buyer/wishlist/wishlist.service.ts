import { Injectable } from '@nestjs/common';
import { WishlistRepository } from '@/_repositories/user/wishlist.repository/wishlist.repository';
import { resolveTranslation } from '@/common/utils/resolve-translation.util';
import type {
  TProductTranslation,
  TShopTranslation,
} from '@/_db/drizzle/schema';

@Injectable()
export class WishlistService {
  constructor(private readonly wishlistRepository: WishlistRepository) {}

  async listItems(userId: string, lang: string) {
    const items = await this.wishlistRepository.listItems(userId);
    return items.map((item) => this.mapWishlistItem(item, lang));
  }

  async addItem(userId: string, variantId: string) {
    const item = await this.wishlistRepository.addItem(userId, variantId);
    return {
      id: item?.id ?? null,
      variantId,
      createdAt: item?.createdAt ?? null,
    };
  }

  async removeItem(userId: string, variantId: string) {
    const removed = await this.wishlistRepository.removeItem(userId, variantId);
    return { removed: removed.length > 0, variantId };
  }

  private mapWishlistItem(
    item: Awaited<ReturnType<WishlistRepository['listItems']>>[number],
    lang: string,
  ) {
    const variant = item.variant;
    const product = variant?.product;
    const shop = product?.shop;
    const productTranslation = resolveTranslation<TProductTranslation>(
      product?.translations,
      lang,
    );
    const shopTranslation = resolveTranslation<TShopTranslation>(
      shop?.translations,
      lang,
    );

    return {
      id: item.id,
      variantId: item.variantId,
      addedAt: item.createdAt,
      variant: variant
        ? {
            id: variant.id,
            sku: variant.sku,
            price: variant.price,
          }
        : null,
      product: product
        ? {
            id: product.id,
            slug: product.slug,
            name: productTranslation?.name ?? '',
            thumbnail: product.thumbnail
              ? { id: product.thumbnail.id, url: product.thumbnail.url }
              : null,
          }
        : null,
      shop: shop
        ? {
            id: shop.id,
            slug: shop.slug,
            name: shopTranslation?.name ?? '',
          }
        : null,
    };
  }
}
