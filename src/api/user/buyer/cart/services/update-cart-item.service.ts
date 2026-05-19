import { Injectable, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { CartRepository } from '@/_repositories/user/cart.repository';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import {
  productVariantsTable,
  inventoryTable,
} from '@/_db/drizzle/schema';
import { ProductStatusEnum } from '@/_db/drizzle/enum';
import { CustomException } from '@/common/exceptions/custom.exception';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
import { computeStockStatus, computeLineTotal } from '../cart.utils';

export type UpdateCartItemResult = {
  id: string;
  variantId: string;
  quantity: number;
  price: string;
  lineTotal: string;
  productName: string;
  productSlug: string;
  productType: string;
  shopId: string;
  thumbnail: { id: string; url: string } | null;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' | 'untracked';
  availableQuantity: number | null;
  maxQuantity: number;
  variantAttributes: {
    growthStage?: string;
    plantForm?: string;
    variegation?: string;
    leafDensity?: string;
    containerType?: string;
    containerSize?: string;
  } | null;
};

@Injectable()
export class UpdateCartItemService {
  private readonly logger = new Logger(UpdateCartItemService.name);

  constructor(
    private readonly cartRepository: CartRepository,
    private readonly db: DrizzleService,
  ) {}

  async executeByCartIdAndItem(
    cartId: string,
    itemId: string,
    dto: UpdateCartItemDto,
    locale: string = 'en',
  ): Promise<UpdateCartItemResult> {
    try {
      return await this.db.transaction(async (tx) => {
        const cartItem = await this.cartRepository.getCartItemById(itemId);

        if (!cartItem || cartItem.cartId !== cartId) {
          throw CustomException.notFound({
            message: 'Cart item not found',
            details: `Item ID: ${itemId}`,
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
            plantAttributes: {
              columns: {
                growthStage: true,
                plantForm: true,
                variegation: true,
                leafDensity: true,
                containerType: true,
                containerSize: true,
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

        if (variant.product.status !== ProductStatusEnum.ACTIVE) {
          throw CustomException.badRequest({
            message: 'This product is not available for purchase',
          });
        }

        const inventory = await this.db.client.query.inventoryTable.findFirst({
          where: eq(inventoryTable.variantId, cartItem.variantId),
        }) ?? null;

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

        return this.mapCartItem(updatedItem, variant, inventory, locale);
      });
    } catch (error) {
      if (error instanceof CustomException) throw error;
      this.logger.error(
        `Failed to update cart item ${itemId} in cart ${cartId}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  private mapCartItem(
    item: { id: string; variantId: string; quantity: number },
    variant: NonNullable<Awaited<ReturnType<typeof this.fetchVariant>>>,
    inventory: Awaited<ReturnType<typeof this.fetchInventory>> | null,
    locale: string,
  ): UpdateCartItemResult {
    const translation = variant.product?.translations?.find((t) => t.locale === locale);
    const price = variant.price ?? '0.00';
    const stockInfo = computeStockStatus(inventory, item.quantity);

    const variantAttributes = variant.plantAttributes
      ? {
          growthStage: variant.plantAttributes.growthStage,
          plantForm: variant.plantAttributes.plantForm,
          variegation: variant.plantAttributes.variegation,
          leafDensity: variant.plantAttributes.leafDensity,
          containerType: variant.plantAttributes.containerType,
          containerSize: variant.plantAttributes.containerSize ?? undefined,
        }
      : null;

    return {
      id: item.id,
      variantId: item.variantId,
      quantity: item.quantity,
      price,
      lineTotal: computeLineTotal(price, item.quantity),
      productName: translation?.name ?? 'Unknown Product',
      productSlug: variant.product?.slug ?? '',
      productType: variant.product?.productType ?? '',
      shopId: variant.product?.shopId ?? '',
      thumbnail: variant.product?.thumbnail
        ? { id: variant.product.thumbnail.id, url: variant.product.thumbnail.url }
        : null,
      stockStatus: stockInfo.stockStatus,
      availableQuantity: stockInfo.availableQuantity,
      maxQuantity: stockInfo.maxQuantity,
      variantAttributes,
    };
  }

  private async fetchVariant(variantId: string) {
    return this.db.client.query.productVariantsTable.findFirst({
      where: eq(productVariantsTable.id, variantId),
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
        plantAttributes: {
          columns: {
            growthStage: true,
            plantForm: true,
            variegation: true,
            leafDensity: true,
            containerType: true,
            containerSize: true,
          },
        },
      },
    });
  }

  private async fetchInventory(variantId: string) {
    return this.db.client.query.inventoryTable.findFirst({
      where: eq(inventoryTable.variantId, variantId),
    });
  }
}
