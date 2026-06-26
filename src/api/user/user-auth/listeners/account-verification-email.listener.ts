import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  AccountVerificationRequestedEvent,
  AuthEventNames,
} from '@/common/modules/events/events';
import { UserAuthService } from '../user-auth.service';

@Injectable()
export class AccountVerificationEmailListener {
  private readonly logger = new Logger(AccountVerificationEmailListener.name);

  constructor(private readonly userAuthService: UserAuthService) {}

  @OnEvent(AuthEventNames.ACCOUNT_VERIFICATION_REQUESTED, { async: true })
  async handleAccountVerificationRequested(
    event: AccountVerificationRequestedEvent,
  ): Promise<{ expiresAt: Date; sent: boolean } | undefined> {
    const { userId, lang, force } = event.payload;

    try {
      return await this.userAuthService.sendAccountVerificationOtp(
        userId,
        lang,
        { force: force ?? false },
      );
    } catch (error) {
      this.logger.error(
        `Failed to send account verification OTP for user ${userId}`,
        error instanceof Error ? error.stack : undefined,
      );
      return undefined;
    }
  }
}
