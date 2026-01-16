import { Body, Controller, Post } from '@nestjs/common';
import {
  ForgotPasswordDto,
  ResendResetOtpDto,
  ResetPasswordDto,
  VerifyResetOtpDto,
} from '../user-auth/dto/password-reset.dto';
import { PasswordResetService } from './password-reset.service';

@Controller({ path: 'user/password-reset', version: '1' })
export class PasswordResetController {
  constructor(private readonly passwordResetService: PasswordResetService) {}

  @Post('forgot')
  async forgotPassword(@Body() payload: ForgotPasswordDto) {
    const result = await this.passwordResetService.forgotPassword(payload.email);
    return {
      success: true,
      message: 'Password reset OTP sent',
      data: result,
    };
  }

  @Post('verify')
  async verifyResetOtp(@Body() payload: VerifyResetOtpDto) {
    const result = await this.passwordResetService.verifyResetOtp(
      payload.token,
      payload.otp,
    );
    return {
      success: true,
      message: 'OTP verified',
      data: result,
    };
  }

  @Post('resend')
  async resendResetOtp(@Body() payload: ResendResetOtpDto) {
    const result = await this.passwordResetService.resendResetOtp(payload.token);
    return {
      success: true,
      message: 'OTP resent',
      data: result,
    };
  }

  @Post('reset')
  async resetPassword(@Body() payload: ResetPasswordDto) {
    await this.passwordResetService.resetPassword(payload.token, payload.password);
    return {
      success: true,
      message: 'Password reset successfully',
    };
  }
}
