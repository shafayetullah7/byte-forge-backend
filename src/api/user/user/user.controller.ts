import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { Request } from 'express';
import { UserAuthGuard } from '@/common/guards/user-auth-guard/user-auth.guard';
import { VerifiedUserAuthGuard } from '@/common/guards/verified-user-auth-guard/verified-user-auth.guard';
import { AuthenticUser } from '@/common/decorators/authentic-user.decorator';
import { TAuthenticUser } from '@/common/types';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Controller({ path: 'user/profile', version: '1' })
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly i18n: I18nService,
  ) {}

  @UseGuards(UserAuthGuard)
  @Get()
  async getUser(@AuthenticUser() userAuth: TAuthenticUser) {
    const i18nContext = I18nContext.current();
    const lang = i18nContext ? i18nContext.lang : 'en';
    const { user } = userAuth;

    const result = await this.userService.getUser(user.id);

    return { success: true, message: this.i18n.t('message.success.userRetrieved', { lang }), data: result.user };
  }
}
