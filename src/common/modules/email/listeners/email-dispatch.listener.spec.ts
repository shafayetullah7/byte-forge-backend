import { EmailDispatchListener } from './email-dispatch.listener';
import { AccountVerificationEmailSendEvent } from '@/common/modules/events/events';

describe('EmailDispatchListener', () => {
  const emailService = {
    sendVerificationEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
  };

  let listener: EmailDispatchListener;

  beforeEach(() => {
    jest.clearAllMocks();
    listener = new EmailDispatchListener(emailService as any);
  });

  it('sends account verification email via template service', async () => {
    await listener.handleAccountVerificationEmail(
      new AccountVerificationEmailSendEvent({
        to: 'user@example.com',
        otp: '123456',
        lang: 'en',
      }),
    );

    expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
      'user@example.com',
      '123456',
    );
  });
});
