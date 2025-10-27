import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { UserSessionService } from '@/api/user/user-session/user-session.service';

@Injectable()
export class UserAuthGuard implements CanActivate {
  constructor(private readonly userSessionService: UserSessionService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const sessionId = request.cookies?.sessionId as undefined | string;

    console.log({ sessionId });

    if (!sessionId) {
      throw new UnauthorizedException('Unauthorized access');
      //   return false;
    }
    console.log('here');

    const userSession = await this.userSessionService.getUserSession(sessionId);
    console.log(userSession);
    if (!userSession) {
      throw new UnauthorizedException('Unauthorized access');
      //   return false;
    }
    const active = this.userSessionService.isSessionActive(userSession);
    if (!active) {
      throw new UnauthorizedException('Unauthorized access. Session expired.');
      //   return false;
    }

    request.user = { ...userSession, role: 'user' };

    return true;
  }
}
