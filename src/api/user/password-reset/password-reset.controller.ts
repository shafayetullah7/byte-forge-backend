import { Body, Controller, Post } from '@nestjs/common';
import {
  ForgotPasswordDto,
  ResendResetOtpDto,
  ResetPasswordDto,
  VerifyResetOtpDto,
} from '../user-auth/dto/password-reset.dto';
import { PasswordResetService } from './password-reset.service';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Password Reset')
@Controller({ path: 'user/password-reset', version: '1' })
export class PasswordResetController {
  constructor(
    private readonly passwordResetService: PasswordResetService,
    private readonly i18n: I18nService,
  ) {}

  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset OTP sent' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Post('forgot')
  async forgotPassword(@Body() payload: ForgotPasswordDto) {
    const i18nContext = I18nContext.current();
    const lang = i18nContext ? i18nContext.lang : 'en';
    const result = await this.passwordResetService.forgotPassword(
      payload.email,
      lang,
    );
    return {
      success: true,
      message: this.i18n.t('message.success.passwordResetRequested', { lang }),
      data: result,
    };
  }

  @ApiOperation({ summary: 'Verify password reset OTP' })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  @Post('verify')
  async verifyResetOtp(@Body() payload: VerifyResetOtpDto) {
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

  @ApiOperation({ summary: 'Resend password reset OTP' })
  @ApiResponse({ status: 200, description: 'OTP resent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid token' })
  @Post('resend')
  async resendResetOtp(@Body() payload: ResendResetOtpDto) {
    const i18nContext = I18nContext.current();
    const lang = i18nContext ? i18nContext.lang : 'en';
    const result = await this.passwordResetService.resendResetOtp(
      payload.token,
      lang,
    );
    return {
      success: true,
      message: this.i18n.t('message.success.otpResent', { lang }),
      data: result,
    };
  }

  @ApiOperation({ summary: 'Reset password with new password' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid token or password' })
  @Post('reset')
  async resetPassword(@Body() payload: ResetPasswordDto) {
    const i18nContext = I18nContext.current();
    const lang = i18nContext ? i18nContext.lang : 'en';
    await this.passwordResetService.resetPassword(
      payload.token,
      payload.password,
    );
    return {
      success: true,
      message: this.i18n.t('message.success.passwordReset', { lang }),
    };
  }
}
