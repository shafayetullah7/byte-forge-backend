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
import { LocalAuthenticUser } from '@/common/decorators/local-authentic-user.decorator';
import { TLocalAuthenticUser, AuthAccess } from '@/common/types';
import { VerifyEmailDto } from './dto/verify-email.dto';
// import { LocalLoginDto } from './dto/local-login.dto';

@Controller({ path: 'user/auth', version: '1' })
export class UserAuthController {
  constructor(
    private readonly userAuthService: UserAuthService,
    private readonly cookieService: CookieService,
  ) {}

  @Post('register')
  async register(@Body() payload: CreateLocalUserDto) {
    const result = await this.userAuthService.register(payload);
    return { success: true, message: 'New user created', data: { ...result } };
  }

  @UseGuards(UserLocalAuthGuard)
  @Post('login')
  async login(
    @LocalAuthenticUser() userAuth: TLocalAuthenticUser,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    // @Body() payload: LocalLoginDto,
  ) {
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
      message: 'User logged in',
      data: {
        session: result,
      },
    };
  }

  @UseGuards(UserAuthGuard)
  @Get('/check')
  checkAuth(@Req() req: Request) {
    const auth = req.user as AuthAccess;
    if (!auth || auth.role !== 'user') {
      throw new UnauthorizedException('Unauthorized access');
    }

    const { user } = auth;

    return { success: true, message: 'User authenticated', data: user };
  }

  @UseGuards(UserAuthGuard)
  @Post('verify-email')
  async verifyEmail(@Req() req: Request, @Body() payload: VerifyEmailDto) {
    const auth = req.user as AuthAccess;
    if (!auth || auth.role !== 'user') {
      throw new UnauthorizedException('Unauthorized access');
    }

    await this.userAuthService.verifyEmail(auth.user.id, payload.otp);

    return {
      success: true,
      message: 'Email verified successfully',
    };
  }

  @UseGuards(UserAuthGuard)
  @Post('send-verification-email')
  async sendVerificationEmail(@Req() req: Request) {
    const auth = req.user as AuthAccess;
    if (!auth || auth.role !== 'user') {
      throw new UnauthorizedException('Unauthorized access');
    }

    await this.userAuthService.resendVerification(auth.user.id);

    return {
      success: true,
      message: 'Verification code sent to your email',
    };
  }
}
