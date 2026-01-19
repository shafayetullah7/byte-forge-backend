import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UserAuthService } from './user-auth.service';
import { UserLocalAuthGuard } from '@/common/guards/user-local-auth-guard/user-local-auth.guard';
import { Request, Response } from 'express';
import { parseDeviceInfo } from '@/common/utils/get-divice-info';
import { getClientIp } from '@/common/utils/get-client-ip';
import { CreateLocalUserDto } from './dto/create-local-user.dto';
import { CookieService } from '@/common/modules/cookie/cookie.service';
import { UserAuthGuard } from '@/common/guards/user-auth-guard/user-auth.guard';
import { VerifiedUserAuthGuard } from '@/common/guards/verified-user-auth-guard/verified-user-auth.guard';
import { LocalAuthenticUser } from '@/common/decorators/local-authentic-user.decorator';
import { TLocalAuthenticUser, AuthAccess } from '@/common/types';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { I18nContext, I18nService } from 'nestjs-i18n';

// import { LocalLoginDto } from './dto/local-login.dto';

@Controller({ path: 'user/auth', version: '1' })
export class UserAuthController {
  constructor(
    private readonly userAuthService: UserAuthService,
    private readonly cookieService: CookieService,
    private readonly i18n: I18nService,
  ) {}

  @Post('register')
  async register(@Body() payload: CreateLocalUserDto, @Req() req: Request) {
    const i18nContext = I18nContext.current();
    const lang = i18nContext ? i18nContext.lang : 'en';
    const result = await this.userAuthService.register(payload, lang);
    return { success: true, message: this.i18n.t('message.success.userCreated', { lang }), data: { ...result } };
  }

  @UseGuards(UserLocalAuthGuard)
  @Post('login')
  async login(
    @LocalAuthenticUser() userAuth: TLocalAuthenticUser,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    // @Body() payload: LocalLoginDto,
  ) {
    const i18nContext = I18nContext.current();
    const lang = i18nContext ? i18nContext.lang : 'en';
    const userAgent = req.headers['user-agent'] || '';
    const deviceInfo = parseDeviceInfo(userAgent);
    const ip = getClientIp(req);
    const result = await this.userAuthService.login({
      userAuth,
      deviceInfo,
      ip,
    });

    // console.log

    this.cookieService.setSessionCookie(res, result.id);

    return {
      success: true,
      message: this.i18n.t('message.success.userLoggedIn', { lang }),
      data: {
        session: result,
        user: userAuth.user,
      },
    };
  }

  @UseGuards(UserAuthGuard)
  @Get('/check')
  checkAuth(@Req() req: Request) {
    const i18nContext = I18nContext.current();
    const lang = i18nContext ? i18nContext.lang : 'en';
    const auth = req.user as AuthAccess;
    if (!auth || auth.role !== 'user') {
      throw new UnauthorizedException(this.i18n.t('message.error.unauthorized', { lang }));
    }

    const { user } = auth;

    return { success: true, message: this.i18n.t('message.success.userAuthenticated', { lang }), data: user };
  }

  @UseGuards(UserAuthGuard)
  @Post('verify-email')
  async verifyEmail(@Req() req: Request, @Body() payload: VerifyEmailDto) {
    const i18nContext = I18nContext.current();
    const lang = i18nContext ? i18nContext.lang : 'en';
    const auth = req.user as AuthAccess;
    if (!auth || auth.role !== 'user') {
      throw new UnauthorizedException(this.i18n.t('message.error.unauthorized', { lang }));
    }

    await this.userAuthService.verifyEmail(auth.user.id, payload.otp);

    return {
      success: true,
      message: this.i18n.t('message.success.emailVerified', { lang }),
    };
  }

  @UseGuards(UserAuthGuard)
  @Post('send-verification-email')
  async sendVerificationEmail(@Req() req: Request) {
    const i18nContext = I18nContext.current();
    const lang = i18nContext ? i18nContext.lang : 'en';
    const auth = req.user as AuthAccess;
    if (!auth || auth.role !== 'user') {
      throw new UnauthorizedException(this.i18n.t('message.error.unauthorized', { lang }));
    }

    const { expiresAt } = await this.userAuthService.resendVerification(auth.user.id, lang);

    return {
      success: true,
      message: this.i18n.t('message.success.verificationSent', { lang }),
      data: { expiresAt },
    };
  }

  @UseGuards(UserAuthGuard)
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const i18nContext = I18nContext.current();
    const lang = i18nContext ? i18nContext.lang : 'en';
    const sessionId = req.cookies?.sessionId;
    if (sessionId) {
      await this.userAuthService.logout(sessionId);
    }
    this.cookieService.clearSessionCookie(res);

    return {
      success: true,
      message: this.i18n.t('message.success.loggedOut', { lang }),
    };
  }

  // === Password Reset Flow ===


}
