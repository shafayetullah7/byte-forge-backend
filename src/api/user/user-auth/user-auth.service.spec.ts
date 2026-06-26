import { UserAuthService } from './user-auth.service';
import { OtpPurpose } from '@/_db/drizzle/enum/otp.purpose.enum';

describe('UserAuthService.sendAccountVerificationOtp', () => {
  const drizzle = {
    client: {
      select: jest.fn(),
    },
  };

  const otpService = {
    getActiveOtpExpiry: jest.fn(),
    createOtp: jest.fn(),
  };

  const emailService = {
    sendVerificationEmail: jest.fn(),
  };

  const userLocalAuthService = {
    getLocalUser: jest.fn(),
  };

  const i18n = {
    t: jest.fn((key: string) => key),
  };

  let service: UserAuthService;

  const mockUserSelect = (rows: unknown[]) => {
    const limit = jest.fn().mockResolvedValue(rows);
    const where = jest.fn().mockReturnValue({ limit });
    const from = jest.fn().mockReturnValue({ where });
    drizzle.client.select.mockReturnValue({ from });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UserAuthService(
      drizzle as any,
      userLocalAuthService as any,
      {} as any,
      {} as any,
      {} as any,
      otpService as any,
      emailService as any,
      {} as any,
      {} as any,
      {} as any,
      i18n as any,
    );
  });

  it('reuses active OTP without sending email when force is false', async () => {
    const existingExpiry = new Date(Date.now() + 2 * 60 * 1000);
    mockUserSelect([{ id: 'user-1', emailVerifiedAt: null }]);
    otpService.getActiveOtpExpiry.mockResolvedValue(existingExpiry);

    const result = await service.sendAccountVerificationOtp('user-1', 'en', {
      force: false,
    });

    expect(otpService.getActiveOtpExpiry).toHaveBeenCalledWith(
      'user-1',
      OtpPurpose.ACCOUNT_VERIFICATION,
    );
    expect(otpService.createOtp).not.toHaveBeenCalled();
    expect(emailService.sendVerificationEmail).not.toHaveBeenCalled();
    expect(result).toEqual({ expiresAt: existingExpiry, sent: false });
  });

  it('creates OTP and sends email when force is true', async () => {
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    mockUserSelect([{ id: 'user-1', emailVerifiedAt: null }]);
    userLocalAuthService.getLocalUser.mockResolvedValue({
      userLocalAuth: { email: 'user@example.com' },
    });
    otpService.createOtp.mockResolvedValue({ otp: '123456', expiresAt });

    const result = await service.sendAccountVerificationOtp('user-1', 'en', {
      force: true,
    });

    expect(otpService.getActiveOtpExpiry).not.toHaveBeenCalled();
    expect(otpService.createOtp).toHaveBeenCalledWith(
      'user-1',
      OtpPurpose.ACCOUNT_VERIFICATION,
    );
    expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
      'user@example.com',
      '123456',
      'en',
    );
    expect(result).toEqual({ expiresAt, sent: true });
  });

  it('creates OTP when no active OTP exists and force is false', async () => {
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    mockUserSelect([{ id: 'user-1', emailVerifiedAt: null }]);
    otpService.getActiveOtpExpiry.mockResolvedValue(null);
    userLocalAuthService.getLocalUser.mockResolvedValue({
      userLocalAuth: { email: 'user@example.com' },
    });
    otpService.createOtp.mockResolvedValue({ otp: '654321', expiresAt });

    const result = await service.sendAccountVerificationOtp('user-1', 'en');

    expect(otpService.createOtp).toHaveBeenCalled();
    expect(emailService.sendVerificationEmail).toHaveBeenCalled();
    expect(result).toEqual({ expiresAt, sent: true });
  });
});
