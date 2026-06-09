import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { UserSessionRepository } from '@/_repositories/auth/user-session-repository/user-session-repository.service';
import { SessionRepository } from '@/_repositories/auth/session.repository/session.repository';
import { CartContext, AccessUserAuth } from '@/common/types';

type RequestWithCart = Request & {
  guestToken?: string;
  cartContext?: CartContext;
  user?: AccessUserAuth;
};

@Injectable()
export class CartAccessGuard implements CanActivate {
  constructor(
    private readonly userSessionRepository: UserSessionRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithCart>();
    const sessionId = request.cookies?.sessionId as string | undefined;
    const guestToken = request.guestToken;

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
          request.user = {
            user: userSession.user,
            session: userSession.session,
          };
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

    request.cartContext = cartContext;

    return true;
  }
}
