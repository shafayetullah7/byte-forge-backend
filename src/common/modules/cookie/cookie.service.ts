import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { AppConfigService } from '../app-config/app-config.service';

@Injectable()
export class CookieService {
  constructor(private readonly configService: AppConfigService) {}

  setSessionCookie(res: Response, token: string) {
    const isProduction = this.configService.nodeEnv === 'production';

    res.cookie('sessionId', token, {
      httpOnly: true,
      secure: isProduction,
      maxAge: this.configService.sessionMaxAge,
      sameSite: isProduction ? 'strict' : 'lax',
      domain: isProduction ? this.configService.cookieDomain : undefined,
      path: '/',
    });
  }

  setAdminSessionCookie(res: Response, token: string) {
    const isProduction = this.configService.nodeEnv === 'production';

    res.cookie('adminSessionId', token, {
      httpOnly: true,
      secure: isProduction,
      maxAge: this.configService.sessionMaxAge,
      sameSite: isProduction ? 'strict' : 'lax',
      domain: isProduction ? this.configService.cookieDomain : undefined,
      path: '/',
    });
  }

  setAdminAccessToken(res: Response, token: string) {
    const isProduction = this.configService.nodeEnv === 'production';

    res.cookie('adminAccessToken', token, {
      httpOnly: true,
      secure: true, // Required for SameSite: None
      maxAge: 3600000, // 1 hour (Access Token lifetime)
      sameSite: 'none',
      domain: isProduction ? this.configService.cookieDomain : undefined,
      path: '/',
    });
  }

  setAdminRefreshToken(res: Response, token: string) {
    const isProduction = this.configService.nodeEnv === 'production';

    res.cookie('adminRefreshToken', token, {
      httpOnly: true,
      secure: true, // Required for SameSite: None
      maxAge: this.configService.sessionMaxAge,
      sameSite: 'none',
      domain: isProduction ? this.configService.cookieDomain : undefined,
      path: '/',
    });
  }

  setXsrfToken(res: Response, token: string) {
    const isProduction = this.configService.nodeEnv === 'production';

    res.cookie('xsrf-token', token, {
      httpOnly: false, // Must be readable by frontend
      secure: true,
      maxAge: this.configService.sessionMaxAge,
      sameSite: 'none',
      domain: isProduction ? this.configService.cookieDomain : undefined,
      path: '/',
    });
  }

  clearSessionCookie(res: Response) {
    const isProduction = this.configService.nodeEnv === 'production';

    res.clearCookie('sessionId', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      domain: isProduction ? this.configService.cookieDomain : undefined,
      path: '/',
    });
  }

  clearAdminSessionCookie(res: Response) {
    const isProduction = this.configService.nodeEnv === 'production';

    res.clearCookie('adminSessionId', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      domain: isProduction ? this.configService.cookieDomain : undefined,
      path: '/',
    });
  }

  clearAdminTokens(res: Response) {
    const isProduction = this.configService.nodeEnv === 'production';

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: 'none' as const,
      domain: isProduction ? this.configService.cookieDomain : undefined,
      path: '/',
    };

    res.clearCookie('adminAccessToken', options);
    res.clearCookie('adminRefreshToken', options);
    res.clearCookie('xsrf-token', { ...options, httpOnly: false });
  }
}
