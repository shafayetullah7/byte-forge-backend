import { Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import * as crypto from 'crypto';
import { AdminAuthService } from './admin-auth.service';
import { CreateLocalAdminDto } from './dto/create.local.admin.dto';
import { Request, Response } from 'express';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { parseDeviceInfo } from '@/common/utils/get-divice-info';
import { getClientIp } from '@/common/utils/get-client-ip';
import { CookieService } from '@/common/modules/cookie/cookie.service';
import { LoginLocalAdminDto } from './dto/login.local.admin.dto';
import { AdminAuthGuard } from '@/common/guards/admin-auth-guard/admin-auth.guard';
import { AuthenticAdminUser } from '@/common/decorators/authentic-admin.decorator';
import { AuthenticAdmin } from '@/common/types';
import { AdminSessionService } from '../admin-session/admin-session.service';

@Controller({ path: 'admin/auth', version: '1' })
export class AdminAuthController {
  constructor(
    private readonly adminAuthService: AdminAuthService,
    private readonly adminSessionService: AdminSessionService,
    private readonly cookieService: CookieService,
    private readonly i18n: I18nService,
  ) {}

  @Post('register')
  async register(@Body() payload: CreateLocalAdminDto, @Req() req: Request) {
    const i18nContext = I18nContext.current();
    const lang = i18nContext ? i18nContext.lang : 'en';
    
    const result = await this.adminAuthService.register(payload);
    
    return {
      success: true,
      message: this.i18n.t('message.success.userCreated', { lang }),
      data: result,
    };
  }

  @Post('login')
  async login(
    @Body() payload: LoginLocalAdminDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const i18nContext = I18nContext.current();
    const lang = i18nContext ? i18nContext.lang : 'en';
    
    const userAgent = req.headers['user-agent'] || '';
    const deviceInfo = parseDeviceInfo(userAgent);
    const ip = getClientIp(req);
    
    const { tokens, admin, session } = await this.adminAuthService.login(
      payload.email,
      payload.password,
      deviceInfo,
      ip
    );

    this.cookieService.setAdminAccessToken(res, tokens.accessToken);
    this.cookieService.setAdminRefreshToken(res, tokens.refreshToken);
    
    // Set XSRF Token for Double Submit Cookie protection
    const xsrfToken = crypto.randomUUID();
    this.cookieService.setXsrfToken(res, xsrfToken);

    return {
      success: true,
      message: this.i18n.t('message.success.userLoggedIn', { lang }),
      data: {
        tokens,
        admin,
      },
    };
  }

  @UseGuards(AdminAuthGuard)
  @Get('check')
  async checkAuth(@AuthenticAdminUser() adminAuth: AuthenticAdmin) {
    const i18nContext = I18nContext.current();
    const lang = i18nContext ? i18nContext.lang : 'en';

    const { createdAt, updatedAt, ...adminProfile } = adminAuth.admin;

    return {
      success: true,
      message: this.i18n.t('message.success.userAuthenticated', { lang }),
      data: adminProfile,
    };
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const i18nContext = I18nContext.current();
    const lang = i18nContext ? i18nContext.lang : 'en';

    const refreshToken = req.cookies?.adminRefreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const { tokens, admin, session } =
      await this.adminAuthService.refreshTokens(refreshToken);

    this.cookieService.setAdminAccessToken(res, tokens.accessToken);
    
    // Also rotate XSRF Token
    const xsrfToken = crypto.randomUUID();
    this.cookieService.setXsrfToken(res, xsrfToken);

    return {
      success: true,
      message: this.i18n.t('message.success.userAuthenticated', { lang }),
      data: {
        tokens,
        admin,
      },
    };
  }

  @UseGuards(AdminAuthGuard)
  @Post('logout')
  async logout(
    @AuthenticAdminUser() adminAuth: AuthenticAdmin,
    @Res({ passthrough: true }) res: Response,
  ) {
    const i18nContext = I18nContext.current();
    const lang = i18nContext ? i18nContext.lang : 'en';

    await this.adminSessionService.revokeSession(adminAuth.session.id);
    this.cookieService.clearAdminTokens(res);

    return {
      success: true,
      message: this.i18n.t('message.success.loggedOut', { lang }),
    };
  }
}
