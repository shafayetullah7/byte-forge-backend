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
import { BulkUpdateCartItemsDto } from '../dto/bulk-update-items.dto';
import { computeStockStatus, computeLineTotal } from '../cart.utils';

export type BulkUpdateCartItemResult = {
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

export type BulkUpdateCartResult = {
  updated: BulkUpdateCartItemResult[];
  removed: { itemId: string; variantId: string }[];
  errors: { itemId: string; error: string }[];
};

@Injectable()
export class BulkUpdateCartService {
  private readonly logger = new Logger(BulkUpdateCartService.name);

  constructor(
    private readonly cartRepository: CartRepository,
    private readonly db: DrizzleService,
  ) {}

  async executeByCartId(
    cartId: string,
    dto: BulkUpdateCartItemsDto,
    locale: string = 'en',
  ): Promise<BulkUpdateCartResult> {
    try {
      return await this.db.transaction(async (tx) => {
        const cart = await this.cartRepository.getCartWithItemsById(cartId);

        if (!cart) {
          throw CustomException.notFound({
            message: 'Cart not found',
            details: 'No cart exists',
          });
        }

        const updated: BulkUpdateCartItemResult[] = [];
        const removed: { itemId: string; variantId: string }[] = [];
        const errors: { itemId: string; error: string }[] = [];

        for (const updateItem of dto.items) {
          try {
            const cartItem = await this.cartRepository.getCartItemById(updateItem.itemId);

            if (!cartItem || cartItem.cartId !== cartId) {
              errors.push({ itemId: updateItem.itemId, error: 'Cart item not found' });
              continue;
            }

            if (updateItem.quantity === 0) {
              await this.cartRepository.deleteCartItem(updateItem.itemId, tx);
              removed.push({ itemId: updateItem.itemId, variantId: cartItem.variantId });
              continue;
            }

            const variant = await this.db.client.query.productVariantsTable.findFirst({
              where: eq(productVariantsTable.id, cartItem.variantId),
              with: {
                product: {
                  columns: { id: true, slug: true, productType: true, status: true, shopId: true, thumbnailId: true },
                  with: {
                    thumbnail: { columns: { id: true, url: true } },
                    translations: { columns: { locale: true, name: true } },
                  },
                },
                plantAttributes: {
                  columns: { growthStage: true, plantForm: true, variegation: true, leafDensity: true, containerType: true, containerSize: true },
                },
              },
            });

            if (!variant) {
              errors.push({ itemId: updateItem.itemId, error: 'Product variant not found' });
              continue;
            }

            if (!variant.isActive) {
              errors.push({ itemId: updateItem.itemId, error: 'Product variant is not available' });
              continue;
            }

            if (variant.product.status !== ProductStatusEnum.ACTIVE) {
              errors.push({ itemId: updateItem.itemId, error: 'Product is not available for purchase' });
              continue;
            }

            const inventory = await this.db.client.query.inventoryTable.findFirst({
              where: eq(inventoryTable.variantId, cartItem.variantId),
            }) ?? null;

            if (inventory?.trackInventory) {
              const availableQuantity = inventory.quantity - inventory.reservedQuantity;
              if (availableQuantity < updateItem.quantity) {
                errors.push({
                  itemId: updateItem.itemId,
                  error: `Insufficient stock. Only ${availableQuantity} available`,
                });
                continue;
              }
            }

            const updatedItem = await this.cartRepository.updateCartItem(
              updateItem.itemId,
              { quantity: updateItem.quantity },
              tx,
            );

            const resultItem = this.mapItem(updatedItem, variant, inventory, locale);
            updated.push(resultItem);
          } catch {
            errors.push({ itemId: updateItem.itemId, error: 'Failed to update item' });
          }
        }

        return { updated, removed, errors };
      });
    } catch (error) {
      if (error instanceof CustomException) throw error;
      this.logger.error(
        `Failed to bulk update cart ${cartId}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  private mapItem(
    item: { id: string; variantId: string; quantity: number },
    variant: NonNullable<Awaited<ReturnType<typeof this.fetchVariant>>>,
    inventory: Awaited<ReturnType<typeof this.fetchInventory>> | null,
    locale: string,
  ): BulkUpdateCartItemResult {
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
          columns: { id: true, slug: true, productType: true, status: true, shopId: true, thumbnailId: true },
          with: {
            thumbnail: { columns: { id: true, url: true } },
            translations: { columns: { locale: true, name: true } },
          },
        },
        plantAttributes: {
          columns: { growthStage: true, plantForm: true, variegation: true, leafDensity: true, containerType: true, containerSize: true },
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
