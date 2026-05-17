import { Injectable, Logger } from '@nestjs/common';
import { CartRepository } from '@/_repositories/user/cart.repository';
import { CustomException } from '@/common/exceptions/custom.exception';

@Injectable()
export class ClearCartService {
  private readonly logger = new Logger(ClearCartService.name);

  constructor(private readonly cartRepository: CartRepository) {}

  async execute(userId: string): Promise<void> {
    try {
      const cart = await this.cartRepository.getCartByUserId(userId);

      if (!cart) {
        throw CustomException.notFound({
          message: 'Cart not found',
          details: 'No cart exists for this user',
        });
      }

      await this.cartRepository.deleteAllCartItems(cart.id);
    } catch (error) {
      if (error instanceof CustomException) throw error;
      this.logger.error(
        `Failed to clear cart for user ${userId}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
