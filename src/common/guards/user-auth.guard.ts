import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { UserSessionService } from '@/api/user/user-session/user-session.service';
import { SessionService } from '@/api/session/session.service';

@Injectable()
export class UserAuthGuard implements CanActivate {
  constructor(
    private readonly userSessionService: UserSessionService,
    private readonly sessionService: SessionService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const sessionId = request.cookies?.sessionId as undefined | string;

    if (!sessionId) {
      throw new UnauthorizedException('Unauthorized access');
    }

    const userSession = await this.userSessionService.getUserSession(sessionId);

    if (!userSession) {
      throw new UnauthorizedException('Unauthorized access');
    }

    const active = this.sessionService.isSessionActive(userSession.session);
    if (!active) {
      throw new UnauthorizedException('Unauthorized access. Session expired.');
    }

    request.user = { ...userSession, role: 'user' };

    return true;
  }
}
