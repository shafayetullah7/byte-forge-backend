import { Injectable, Logger } from '@nestjs/common';
import { CartRepository } from '@/_repositories/user/cart.repository';
import { CustomException } from '@/common/exceptions/custom.exception';

@Injectable()
export class ClearCartService {
  private readonly logger = new Logger(ClearCartService.name);

  constructor(private readonly cartRepository: CartRepository) {}

  async executeByCartId(cartId: string): Promise<void> {
    try {
      const cart = await this.cartRepository.getCartWithItemsById(cartId);

      if (!cart) {
        throw CustomException.notFound({
          message: 'Cart not found',
          details: 'No cart exists',
        });
      }

      await this.cartRepository.deleteAllCartItems(cartId);
    } catch (error) {
      if (error instanceof CustomException) throw error;
      this.logger.error(
        `Failed to clear cart ${cartId}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
