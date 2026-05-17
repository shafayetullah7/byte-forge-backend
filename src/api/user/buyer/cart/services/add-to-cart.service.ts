import { Injectable, Logger } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { CartRepository } from '@/_repositories/user/cart.repository';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import {
  productVariantsTable,
  inventoryTable,
  productsTable,
} from '@/_db/drizzle/schema';
import { CustomException } from '@/common/exceptions/custom.exception';
import { HttpStatus } from '@nestjs/common';
import { AddToCartDto } from '../dto/add-to-cart.dto';

export type AddToCartResult = {
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
export class AddToCartService {
  private readonly logger = new Logger(AddToCartService.name);

  constructor(
    private readonly cartRepository: CartRepository,
    private readonly db: DrizzleService,
  ) {}

  async execute(userId: string, dto: AddToCartDto): Promise<AddToCartResult> {
    try {
      return await this.db.transaction(async (tx) => {
        const variant = await this.db.client.query.productVariantsTable.findFirst({
          where: eq(productVariantsTable.id, dto.variantId),
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
            message: 'Product variant not found',
            details: `Variant ID: ${dto.variantId}`,
          });
        }

        if (!variant.isActive) {
          throw CustomException.badRequest({
            message: 'This product variant is not available',
            details: 'The variant has been deactivated',
          });
        }

        if (variant.product.status !== 'ACTIVE') {
          throw CustomException.badRequest({
            message: 'This product is not available for purchase',
            details: `Product status: ${variant.product.status}`,
          });
        }

        const inventory = await this.db.client.query.inventoryTable.findFirst({
          where: eq(inventoryTable.variantId, dto.variantId),
        });

        if (inventory) {
          if (!inventory.trackInventory) {
            // Inventory tracking disabled, allow any quantity
          } else {
            const availableQuantity = inventory.quantity - inventory.reservedQuantity;
            if (availableQuantity < dto.quantity) {
              throw CustomException.badRequest({
                message: 'Insufficient stock',
                details: `Only ${availableQuantity} items available. Requested: ${dto.quantity}`,
              });
            }
          }
        }

        let cart = await this.cartRepository.getCartByUserId(userId);

        if (!cart) {
          cart = await this.cartRepository.createCart(
            { userId },
            tx,
          );
        }

        const existingItem = await this.cartRepository.getCartItem(
          cart.id,
          dto.variantId,
        );

        if (existingItem) {
          const newQuantity = existingItem.quantity + dto.quantity;

          if (inventory?.trackInventory) {
            const availableQuantity = inventory.quantity - inventory.reservedQuantity;
            if (availableQuantity < newQuantity) {
              throw CustomException.badRequest({
                message: 'Insufficient stock for updated quantity',
                details: `Only ${availableQuantity} items available. Current in cart: ${existingItem.quantity}, adding: ${dto.quantity}`,
              });
            }
          }

          const updatedItem = await this.cartRepository.updateCartItem(
            existingItem.id,
            { quantity: newQuantity },
            tx,
          );

          return this.mapCartItem(updatedItem, variant);
        }

        const newItem = await this.cartRepository.createCartItem(
          {
            cartId: cart.id,
            variantId: dto.variantId,
            quantity: dto.quantity,
          },
          tx,
        );

        return this.mapCartItem(newItem, variant);
      });
    } catch (error) {
      if (error instanceof CustomException) throw error;
      this.logger.error(
        `Failed to add item to cart for user ${userId}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  private mapCartItem(
    item: { id: string; variantId: string; quantity: number },
    variant: NonNullable<Awaited<ReturnType<typeof this.fetchVariant>>>,
  ): AddToCartResult {
    const translation = variant.product?.translations?.find((t) => t.locale === 'en');

    return {
      id: item.id,
      variantId: item.variantId,
      quantity: item.quantity,
      price: variant.price ?? '0.00',
      productName: translation?.name ?? 'Unknown Product',
      productSlug: variant.product?.slug ?? '',
      productType: variant.product?.productType ?? '',
      shopId: variant.product?.shopId ?? '',
      thumbnail: variant.product?.thumbnail
        ? { id: variant.product.thumbnail.id, url: variant.product.thumbnail.url }
        : null,
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
      },
    });
  }
}
