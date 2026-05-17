import { Injectable, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { CartRepository } from '@/_repositories/user/cart.repository';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import {
  productVariantsTable,
  inventoryTable,
} from '@/_db/drizzle/schema';
import { CustomException } from '@/common/exceptions/custom.exception';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';

export type UpdateCartItemResult = {
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

@Injectable()
export class UpdateCartItemService {
  private readonly logger = new Logger(UpdateCartItemService.name);

  constructor(
    private readonly cartRepository: CartRepository,
    private readonly db: DrizzleService,
  ) {}

  async execute(
    userId: string,
    itemId: string,
    dto: UpdateCartItemDto,
  ): Promise<UpdateCartItemResult> {
    try {
      return await this.db.transaction(async (tx) => {
        const cartItem = await this.cartRepository.getCartItemById(itemId);

        if (!cartItem) {
          throw CustomException.notFound({
            message: 'Cart item not found',
            details: `Item ID: ${itemId}`,
          });
        }

        const cart = await this.cartRepository.getCartByUserId(userId);

        if (!cart || cartItem.cartId !== cart.id) {
          throw CustomException.forbidden({
            message: 'You do not have permission to modify this cart item',
          });
        }

        const variant = await this.db.client.query.productVariantsTable.findFirst({
          where: eq(productVariantsTable.id, cartItem.variantId),
          with: {
            product: {
              columns: {
                id: true,
                slug: true,
                productType: true,
                status: true,
                shopId: true,
                thumbnailId: true,
              },
              with: {
                thumbnail: {
                  columns: { id: true, url: true },
                },
                translations: {
                  columns: { locale: true, name: true },
                },
              },
            },
          },
        });

        if (!variant) {
          throw CustomException.notFound({
            message: 'Product variant no longer exists',
          });
        }

        if (!variant.isActive) {
          throw CustomException.badRequest({
            message: 'This product variant is not available',
          });
        }

        if (variant.product.status !== 'ACTIVE') {
          throw CustomException.badRequest({
            message: 'This product is not available for purchase',
          });
        }

        const inventory = await this.db.client.query.inventoryTable.findFirst({
          where: eq(inventoryTable.variantId, cartItem.variantId),
        });

        if (inventory?.trackInventory) {
          const availableQuantity = inventory.quantity - inventory.reservedQuantity;
          if (availableQuantity < dto.quantity) {
            throw CustomException.badRequest({
              message: 'Insufficient stock',
              details: `Only ${availableQuantity} items available. Requested: ${dto.quantity}`,
            });
          }
        }

        const updatedItem = await this.cartRepository.updateCartItem(
          itemId,
          { quantity: dto.quantity },
          tx,
        );

        const translation = variant.product?.translations?.find((t) => t.locale === 'en');

        return {
          id: updatedItem.id,
          variantId: updatedItem.variantId,
          quantity: updatedItem.quantity,
          price: variant.price ?? '0.00',
          productName: translation?.name ?? 'Unknown Product',
          productSlug: variant.product?.slug ?? '',
          productType: variant.product?.productType ?? '',
          shopId: variant.product?.shopId ?? '',
          thumbnail: variant.product?.thumbnail
            ? { id: variant.product.thumbnail.id, url: variant.product.thumbnail.url }
            : null,
        };
      });
    } catch (error) {
      if (error instanceof CustomException) throw error;
      this.logger.error(
        `Failed to update cart item ${itemId} for user ${userId}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
