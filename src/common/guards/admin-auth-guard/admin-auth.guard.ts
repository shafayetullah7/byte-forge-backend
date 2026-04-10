import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AdminSessionService } from '@/api/admin/admin-session/admin-session.service';
import { AccessAdminAuth } from '@/common/types';
import { SessionRepository } from '@/_repositories/auth/session.repository/session.repository';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from '@/common/modules/app-config/app-config.service';
import { AdminAuthService } from '@/api/admin/admin-auth/admin-auth.service';
import { CookieService } from '@/common/modules/cookie/cookie.service';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    private readonly adminSessionService: AdminSessionService,
    private readonly sessionRepository: SessionRepository,
    private readonly jwtService: JwtService,
    private readonly configService: AppConfigService,
    private readonly adminAuthService: AdminAuthService,
    private readonly cookieService: CookieService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest() as any;
    const response = context.switchToHttp().getResponse<Response>();

    // 1. CSRF Protection (Double Submit Cookie)
    const stateChangingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
    if (stateChangingMethods.includes(request.method)) {
      const xsrfCookie = request.cookies?.['xsrf-token'];
      const xsrfHeader = request.headers?.['x-xsrf-token'];

      if (!xsrfCookie || !xsrfHeader || xsrfCookie !== xsrfHeader) {
        throw new ForbiddenException('Invalid CSRF token');
      }
    }

    // 2. JWT Verification
    let accessToken = request.cookies?.adminAccessToken;
    const refreshToken = request.cookies?.adminRefreshToken;

    let payload: any;

    try {
      if (!accessToken) {
        throw new Error('No access token');
      }
      payload = await this.jwtService.verifyAsync(accessToken, {
        secret: this.configService.jwtAdminAccessSecret,
      });
    } catch (e) {
      // Access token expired or missing, try refresh
      if (!refreshToken) {
        throw new UnauthorizedException('Authentication required');
      }

      try {
        const refreshResult = await this.adminAuthService.refreshTokens(refreshToken);
        
        // Update access token in cookies (Auto-refresh)
        this.cookieService.setAdminAccessToken(response, refreshResult.tokens.accessToken);
        
        payload = await this.jwtService.verifyAsync(refreshResult.tokens.accessToken, {
          secret: this.configService.jwtAdminAccessSecret,
        });
      } catch (refreshError) {
        throw new UnauthorizedException('Session expired');
      }
    }

    // 3. Session Validation in DB
    const adminSession = await this.adminSessionService.getAdminSession(payload.sessionId);

    if (!adminSession) {
      throw new UnauthorizedException('Invalid session');
    }

    const active = this.sessionRepository.isSessionActive(adminSession.session);
    if (!active) {
      throw new UnauthorizedException('Session expired');
    }

    const requestUser: AccessAdminAuth = {
      admin: adminSession.admin,
      session: adminSession.session,
    };

    request.user = requestUser as any;

    return true;
  }
}
