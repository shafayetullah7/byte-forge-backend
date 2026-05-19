import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { AppConfigService } from '../modules/app-config/app-config.service';

const GUEST_TOKEN_COOKIE = 'guestToken';
const GUEST_TOKEN_MAX_AGE = 90 * 24 * 60 * 60 * 1000; // 90 days

@Injectable()
export class GuestTokenMiddleware implements NestMiddleware {
  constructor(private readonly configService: AppConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    let token = req.cookies?.[GUEST_TOKEN_COOKIE] as string | undefined;

    if (!token) {
      token = randomUUID();
      const isProduction = this.configService.nodeEnv === 'production';

      res.cookie(GUEST_TOKEN_COOKIE, token, {
        httpOnly: true,
        secure: isProduction,
        maxAge: GUEST_TOKEN_MAX_AGE,
        sameSite: isProduction ? 'lax' : 'lax',
        domain: isProduction ? this.configService.cookieDomain : undefined,
        path: '/',
      });
    }

    (req as Request & { guestToken: string }).guestToken = token;

    next();
  }
}
