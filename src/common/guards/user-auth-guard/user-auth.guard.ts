import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { UserSessionRepository } from '@/_repositories/auth/user-session-repository/user-session-repository.service';
import { SessionRepository } from '@/_repositories/auth/session.repository/session.repository';

@Injectable()
export class UserAuthGuard implements CanActivate {
  constructor(
    private readonly userSessionRepository: UserSessionRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const sessionId = request.cookies?.sessionId as undefined | string;

    if (!sessionId) {
      throw new UnauthorizedException('Unauthorized access');
    }

    const userSession =
      await this.userSessionRepository.findUserSessionDetailsBySessionId(
        sessionId,
      );

    if (!userSession) {
      throw new UnauthorizedException('Unauthorized access');
    }

    const active = this.sessionRepository.isSessionActive(userSession.session);
    if (!active) {
      throw new UnauthorizedException('Unauthorized access. Session expired.');
    }

    request.user = { ...userSession, role: 'user' };

    return true;
  }
}
