import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { UserSessionRepository } from '@/_repositories/auth/user-session-repository/user-session-repository.service';
import { SessionRepository } from '@/_repositories/auth/session.repository/session.repository';
import { CartContext } from '@/common/types/cart-context.type';

@Injectable()
export class CartAccessGuard implements CanActivate {
  constructor(
    private readonly userSessionRepository: UserSessionRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const sessionId = request.cookies?.sessionId as undefined | string;
    const guestToken = (request as Request & { guestToken: string }).guestToken;

    let userId: string | undefined;
    let pendingMerge = false;

    if (sessionId) {
      const userSession =
        await this.userSessionRepository.findUserSessionDetailsBySessionId(
          sessionId,
        );

      if (userSession) {
        const active = this.sessionRepository.isSessionActive(
          userSession.session,
        );
        if (active) {
          userId = userSession.user.id;
          request.user = { ...userSession };
        }
      }
    }

    if (!userId && !guestToken) {
      throw new UnauthorizedException('Unauthorized access');
    }

    if (userId && guestToken) {
      pendingMerge = true;
    }

    const cartContext: CartContext = {
      userId,
      guestToken,
      pendingMerge,
    };

    (request as Request & { cartContext: CartContext }).cartContext =
      cartContext;

    return true;
  }
}
