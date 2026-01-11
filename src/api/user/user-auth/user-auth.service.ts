import { Injectable } from '@nestjs/common';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { UserAuth } from './types/user-auth.type';
import { CreateLocalUserDto } from './dto/create-local-user.dto';
import { UserLocalAuthService } from './user-local-auth.service';
import { UserService } from '../user/user.service';
import { DeviceInfo, TSession, userTable } from '@/_db/drizzle/schema';
import { UserSessionRepository } from '@/_repositories/auth/user-session-repository/user-session-repository.service';
import { SessionRepository } from '@/_repositories/auth/session.repository/session.repository';
import { UserLocalAuthSessionRepositoryService } from '@/_repositories/auth/user-local-auth-session-repository/user-local-auth-session-repository.service';
import { OtpService } from '@/common/modules/otp/otp.service';
import { EmailService } from '@/common/modules/email/email.service';
import { OtpPurpose } from '@/_db/drizzle/enum/otp.purpose.enum';
import { CustomException } from '@/common/exceptions/custom.exception';
import { ErrorCode } from '@/common/modules/response/dto/error.schema';
import { HttpStatus } from '@nestjs/common';
import { eq } from 'drizzle-orm';

@Injectable()
export class UserAuthService {
  constructor(
    private readonly drizzle: DrizzleService,
    private readonly userLocalAuthService: UserLocalAuthService,
    private readonly userService: UserService,
    private readonly userSessionRepository: UserSessionRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly userLocalAuthSessionRepository: UserLocalAuthSessionRepositoryService,
    private readonly otpService: OtpService,
    private readonly emailService: EmailService,
  ) {}

  async register(payload: CreateLocalUserDto) {
    const { email, password, firstName, lastName, userName } = payload;

    const result = await this.drizzle.client.transaction(async (tx) => {
      const user = await this.userService.createUser(
        {
          firstName,
          lastName,
          userName,
        },
        tx,
      );
      const localAuth = await this.userLocalAuthService.createUserLocalAuth(
        { email, password, userId: user.id },
        tx,
      );

      return { user, localAuth };
    });

    return result;
  }

  async login(payload: {
    userAuth: UserAuth;
    deviceInfo: DeviceInfo;
    ip: string;
  }): Promise<TSession> {
    const result = await this.drizzle.transaction(async (tx) => {
      const { userAuth, deviceInfo, ip } = payload;
      const { user } = userAuth;
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // now + 7 days

      const sessionData = {
        deviceInfo,
        ip,
        expiresAt,
      };

      const newSession = await this.sessionRepository.create(sessionData, tx);
      const userSessionData = {
        sessionId: newSession.id,
        userId: user.id,
      };
      await this.userSessionRepository.createUserSession(userSessionData, tx);

      if (userAuth.userLocalAuth) {
        const userSessionLocalAuthData = {
          sessionId: newSession.id,
          localAuthId: userAuth.userLocalAuth.userId,
        };
        await this.userLocalAuthSessionRepository.createUserLocalAuthSession(
          userSessionLocalAuthData,
          tx,
        );
      }

      return newSession;
    });

    return result;
  }

  async verifyEmail(userId: string, otp: string): Promise<void> {
    // Verify OTP
    await this.otpService.verifyOtp(
      userId,
      otp,
      OtpPurpose.ACCOUNT_VERIFICATION,
    );

    // Update user's emailVerifiedAt
    await this.drizzle.client
      .update(userTable)
      .set({ emailVerifiedAt: new Date() })
      .where(eq(userTable.id, userId));
  }

  async resendVerification(userId: string): Promise<void> {
    // Get user's email verification status
    const [user] = await this.drizzle.client
      .select({
        id: userTable.id,
        emailVerifiedAt: userTable.emailVerifiedAt,
      })
      .from(userTable)
      .where(eq(userTable.id, userId))
      .limit(1);

    if (!user) {
      throw new CustomException(
        'User not found',
        HttpStatus.NOT_FOUND,
        ErrorCode.NOT_FOUND,
      );
    }

    // Check if already verified
    if (user.emailVerifiedAt) {
      throw new CustomException(
        'Email already verified',
        HttpStatus.CONFLICT,
        ErrorCode.EMAIL_ALREADY_VERIFIED,
      );
    }

    // Get user's local auth email
    const localUser = await this.userLocalAuthService.getLocalUser({
      id: userId,
    });

    if (!localUser) {
      throw new CustomException(
        'User email not found',
        HttpStatus.NOT_FOUND,
        ErrorCode.NOT_FOUND,
      );
    }

    // Generate and send OTP (handles both initial send and resend)
    const otp = await this.otpService.createOtp(
      userId,
      OtpPurpose.ACCOUNT_VERIFICATION,
    );
    await this.emailService.sendVerificationEmail(
      localUser.userLocalAuth.email,
      otp,
    );
  }
}
