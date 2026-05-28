import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserLoggedInEvent } from '@/common/modules/events/events';
import { CartService } from '../cart.service';

@Injectable()
export class CartMergeListener {
  private readonly logger = new Logger(CartMergeListener.name);

  constructor(private readonly cartService: CartService) {}

  @OnEvent('auth.user.loggedin')
  async handleUserLoggedIn(payload: UserLoggedInEvent) {
    const { userId, guestToken } = payload;

    if (!userId || !guestToken) {
      return;
    }

    try {
      await this.cartService.mergeGuestCart(userId, guestToken);
      this.logger.log(
        `Guest cart merged for user ${userId} (guestToken: ${guestToken})`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to merge guest cart for user ${userId}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
