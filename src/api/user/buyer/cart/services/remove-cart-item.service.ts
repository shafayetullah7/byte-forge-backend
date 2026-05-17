import { Injectable, Logger } from '@nestjs/common';
import { CartRepository } from '@/_repositories/user/cart.repository';
import { CustomException } from '@/common/exceptions/custom.exception';

@Injectable()
export class RemoveCartItemService {
  private readonly logger = new Logger(RemoveCartItemService.name);

  constructor(private readonly cartRepository: CartRepository) {}

  async execute(userId: string, itemId: string): Promise<void> {
    try {
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
          message: 'You do not have permission to remove this cart item',
        });
      }

      await this.cartRepository.deleteCartItem(itemId);
    } catch (error) {
      if (error instanceof CustomException) throw error;
      this.logger.error(
        `Failed to remove cart item ${itemId} for user ${userId}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
