import { Body, Controller, Post, Req } from '@nestjs/common';
import {
  ForgotPasswordDto,
  ResendResetOtpDto,
  ResetPasswordDto,
  VerifyResetOtpDto,
} from '../user-auth/dto/password-reset.dto';
import { PasswordResetService } from './password-reset.service';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { Request } from 'express';

@Controller({ path: 'user/password-reset', version: '1' })
export class PasswordResetController {
  constructor(
    private readonly passwordResetService: PasswordResetService,
    private readonly i18n: I18nService,
  ) {}

  @Post('forgot')
  async forgotPassword(@Body() payload: ForgotPasswordDto, @Req() req: Request) {
    const i18nContext = I18nContext.current();
    const lang = i18nContext ? i18nContext.lang : 'en';
    const result = await this.passwordResetService.forgotPassword(payload.email, lang);
    return {
      success: true,
      message: this.i18n.t('message.success.passwordResetRequested', { lang }),
      data: result,
    };
  }

  @Post('verify')
  async verifyResetOtp(@Body() payload: VerifyResetOtpDto, @Req() req: Request) {
    const i18nContext = I18nContext.current();
    const lang = i18nContext ? i18nContext.lang : 'en';
    const result = await this.passwordResetService.verifyResetOtp(
      payload.token,
      payload.otp,
    );
    return {
      success: true,
      message: this.i18n.t('message.success.otpVerified', { lang }),
      data: result,
    };
  }

  @Post('resend')
  async resendResetOtp(@Body() payload: ResendResetOtpDto, @Req() req: Request) {
    const i18nContext = I18nContext.current();
    const lang = i18nContext ? i18nContext.lang : 'en';
    const result = await this.passwordResetService.resendResetOtp(payload.token, lang);
    return {
      success: true,
      message: this.i18n.t('message.success.otpResent', { lang }),
      data: result,
    };
  }

  @Post('reset')
  async resetPassword(@Body() payload: ResetPasswordDto, @Req() req: Request) {
    const i18nContext = I18nContext.current();
    const lang = i18nContext ? i18nContext.lang : 'en';
    await this.passwordResetService.resetPassword(payload.token, payload.password);
    return {
      success: true,
      message: this.i18n.t('message.success.passwordReset', { lang }),
    };
  }
}
