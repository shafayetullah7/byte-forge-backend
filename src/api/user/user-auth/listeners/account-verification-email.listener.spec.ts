import { AccountVerificationEmailListener } from './account-verification-email.listener';
import { AccountVerificationRequestedEvent } from '@/common/modules/events/events';

describe('AccountVerificationEmailListener', () => {
  const userAuthService = {
    sendAccountVerificationOtp: jest.fn(),
  };

  let listener: AccountVerificationEmailListener;

  beforeEach(() => {
    jest.clearAllMocks();
    listener = new AccountVerificationEmailListener(userAuthService as any);
  });

  it('calls sendAccountVerificationOtp with force false by default', async () => {
    const expiresAt = new Date();
    userAuthService.sendAccountVerificationOtp.mockResolvedValue({
      expiresAt,
      sent: false,
    });

    const result = await listener.handleAccountVerificationRequested(
      new AccountVerificationRequestedEvent({
        userId: 'user-1',
        lang: 'en',
      }),
    );

    expect(userAuthService.sendAccountVerificationOtp).toHaveBeenCalledWith(
      'user-1',
      'en',
      { force: false },
    );
    expect(result).toEqual({ expiresAt, sent: false });
  });

  it('passes force true when requested', async () => {
    const expiresAt = new Date();
    userAuthService.sendAccountVerificationOtp.mockResolvedValue({
      expiresAt,
      sent: true,
    });

    await listener.handleAccountVerificationRequested(
      new AccountVerificationRequestedEvent({
        userId: 'user-1',
        lang: 'bn',
        force: true,
      }),
    );

    expect(userAuthService.sendAccountVerificationOtp).toHaveBeenCalledWith(
      'user-1',
      'bn',
      { force: true },
    );
  });

  it('returns undefined when service throws', async () => {
    userAuthService.sendAccountVerificationOtp.mockRejectedValue(
      new Error('email failed'),
    );

    const result = await listener.handleAccountVerificationRequested(
      new AccountVerificationRequestedEvent({
        userId: 'user-1',
        lang: 'en',
      }),
    );

    expect(result).toBeUndefined();
  });
});
