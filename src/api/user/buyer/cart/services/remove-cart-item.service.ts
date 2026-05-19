import { Injectable, Logger } from '@nestjs/common';
import { CartRepository } from '@/_repositories/user/cart.repository';
import { CustomException } from '@/common/exceptions/custom.exception';

@Injectable()
export class RemoveCartItemService {
  private readonly logger = new Logger(RemoveCartItemService.name);

  constructor(private readonly cartRepository: CartRepository) {}

  async executeByCartIdAndItem(cartId: string, itemId: string): Promise<void> {
    try {
      const cartItem = await this.cartRepository.getCartItemById(itemId);

      if (!cartItem || cartItem.cartId !== cartId) {
        throw CustomException.notFound({
          message: 'Cart item not found',
          details: `Item ID: ${itemId}`,
        });
      }

      await this.cartRepository.deleteCartItem(itemId);
    } catch (error) {
      if (error instanceof CustomException) throw error;
      this.logger.error(
        `Failed to remove cart item ${itemId} from cart ${cartId}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
