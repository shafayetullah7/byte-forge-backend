import { ConflictException, Injectable } from '@nestjs/common';
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
import { UserRepository } from '@/_repositories/user/user.repository/user.repository';
import { UserLocalAuthRepository } from '@/_repositories/user/user.local.auth.repository/user.local.auth.repository';

import { HashingService } from '@/common/modules/hashing/hashing.service';

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
    private readonly userRepository: UserRepository,
    private readonly userLocalAuthRepository: UserLocalAuthRepository,

    private readonly hashingService: HashingService,
  ) {}



  async register(payload: CreateLocalUserDto) {
    const { email, password, firstName, lastName, userName } = payload;

    // Check if username already exists using UserRepository
    const existingUserByUsername = await this.userRepository.findOne({
      userName,
    });
    if (existingUserByUsername) {
      throw new CustomException({
        message: 'Username already exists',
        statusCode: HttpStatus.CONFLICT,
        errorCode: ErrorCode.DUPLICATE_ENTRY,
      });
    }

    // Check if email already exists using UserLocalAuthRepository
    const existingUserByEmail = await this.userLocalAuthRepository.findOne({
      email,
    });
    if (existingUserByEmail) {
      throw new CustomException({
        message: 'Email already exists',
        statusCode: HttpStatus.CONFLICT,
        errorCode: ErrorCode.DUPLICATE_ENTRY,
      });
    }

    // Create user in transaction
    try {
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
    } catch (error) {
      // Handle ConflictException from service layer (race condition fallback)
      if (error instanceof ConflictException) {
        throw new CustomException({
          message: error.message,
          statusCode: HttpStatus.CONFLICT,
          errorCode: ErrorCode.DUPLICATE_ENTRY,
        });
      }

      // Re-throw other errors
      throw error;
    }
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
    await this.drizzle.client.transaction(async (tx) => {
      // Check if already verified to handle race conditions/redundant requests
      const user = await this.userRepository.findById(userId, {
        tx,
        lock: true,
      });

      if (user?.emailVerifiedAt) {
        throw new CustomException({
          message: 'Email already verified',
          statusCode: HttpStatus.CONFLICT,
          errorCode: ErrorCode.EMAIL_ALREADY_VERIFIED,
        });
      }

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
    });
  }

  async resendVerification(userId: string): Promise<{ expiresAt: Date }> {
    // Get user's email verification status
    const [user] = await this.drizzle.client
      .select({
        id: userTable.id,
        emailVerifiedAt: userTable.emailVerifiedAt,
      })
      .from(userTable)
      .where(eq(userTable.id, userId))
      .limit(1);

    console.log('[DEBUG] resendVerification for user:', userId, 'Found:', !!user);

    if (!user) {
      throw new CustomException({
        message: 'User not found',
        statusCode: HttpStatus.NOT_FOUND,
        errorCode: ErrorCode.NOT_FOUND,
      });
    }

    // Check if already verified
    if (user.emailVerifiedAt) {
      throw new CustomException({
        message: 'Email already verified',
        statusCode: HttpStatus.CONFLICT,
        errorCode: ErrorCode.EMAIL_ALREADY_VERIFIED,
      });
    }

    // Get user's local auth email
    const localUser = await this.userLocalAuthService.getLocalUser({
      id: userId,
    });

    if (!localUser) {
      throw new CustomException({
        message: 'User email not found',
        statusCode: HttpStatus.NOT_FOUND,
        errorCode: ErrorCode.NOT_FOUND,
      });
    }

    // Generate and send OTP (handles both initial send and resend)
    const { otp, expiresAt } = await this.otpService.createOtp(
      userId,
      OtpPurpose.ACCOUNT_VERIFICATION,
    );
    console.log('[DEBUG] Sending verification email to:', localUser.userLocalAuth.email);
    console.log('[DEBUG] OTP generated:', otp); // REMOVE IN PRODUCTION
    await this.emailService.sendVerificationEmail(
      localUser.userLocalAuth.email,
      otp,
    );
    console.log('[DEBUG] Verification email sent successfully (service layer)');

    return { expiresAt };
  }

  async logout(sessionId: string): Promise<void> {
    await this.sessionRepository.update(
      {
        revoked: true,
        logoutAt: new Date(),
      },
      { id: sessionId },
    );
  }
}
