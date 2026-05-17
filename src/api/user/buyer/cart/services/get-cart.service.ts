import { Injectable, Logger } from '@nestjs/common';
import { CartRepository } from '@/_repositories/user/cart.repository';
import { CustomException } from '@/common/exceptions/custom.exception';
import { HttpStatus } from '@nestjs/common';

export type CartItemResult = {
  id: string;
  variantId: string;
  quantity: number;
  price: string;
  productName: string;
  productSlug: string;
  productType: string;
  shopId: string;
  thumbnail: { id: string; url: string } | null;
};

export type CartResult = {
  id: string;
  itemsCount: number;
  items: CartItemResult[];
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class GetCartService {
  private readonly logger = new Logger(GetCartService.name);

  constructor(private readonly cartRepository: CartRepository) {}

  async execute(userId: string): Promise<CartResult | null> {
    try {
      const cart = await this.cartRepository.getCartWithItems(userId);

      if (!cart) {
        return null;
      }

      const items: CartItemResult[] = cart.items.map((item) => {
        const variant = item.variant;
        const product = variant?.product;
        const translation = product?.translations?.find((t) => t.locale === 'en');

        return {
          id: item.id,
          variantId: item.variantId,
          quantity: item.quantity,
          price: variant?.price ?? '0.00',
          productName: translation?.name ?? 'Unknown Product',
          productSlug: product?.slug ?? '',
          productType: product?.productType ?? '',
          shopId: product?.shopId ?? '',
          thumbnail: product?.thumbnail
            ? { id: product.thumbnail.id, url: product.thumbnail.url }
            : null,
        };
      });

      return {
        id: cart.id,
        itemsCount: items.length,
        items,
        createdAt: cart.createdAt,
        updatedAt: cart.updatedAt,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get cart for user ${userId}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
