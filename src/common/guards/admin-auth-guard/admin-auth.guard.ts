import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AdminSessionService } from '@/api/admin/admin-session/admin-session.service';
import { AccessAdminAuth } from '@/common/types';
import { SessionRepository } from '@/_repositories/auth/session.repository/session.repository';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    private readonly adminSessionService: AdminSessionService,
    private readonly sessionRepository: SessionRepository,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const sessionId = request.cookies?.adminSessionId as undefined | string;

    if (!sessionId) {
      throw new UnauthorizedException('Unauthorized access');
    }

    const adminSession =
      await this.adminSessionService.getAdminSession(sessionId);

    if (!adminSession) {
      throw new UnauthorizedException('Unauthorized access');
    }

    const active = this.sessionRepository.isSessionActive(adminSession.session);
    if (!active) {
      throw new UnauthorizedException('Unauthorized access. Session expired.');
    }

    const requestUser: AccessAdminAuth = {
      admin: adminSession.admin,
      session: adminSession.session,
      role: 'admin',
    };

    request.user = requestUser as any;

    return true;
  }
}
