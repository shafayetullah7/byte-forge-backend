import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { AppConfigService } from '@/common/modules/app-config/app-config.service';
import { UserSessionRepository } from '@/_repositories/auth/user-session-repository/user-session-repository.service';
import { SessionRepository } from '@/_repositories/auth/session.repository/session.repository';
import { eq } from 'drizzle-orm';
import { sessionTable } from '@/_db/drizzle/schema';
import { UserAuth } from './types/user-auth.type';
import { TSession, TUser } from '@/_db/drizzle/schema';

interface RefreshTokenResult {
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  user: TUser;
  session: TSession;
}

@Injectable()
export class UserAuthV2Service {
  constructor(
    private readonly drizzle: DrizzleService,
    private readonly jwtService: JwtService,
    private readonly configService: AppConfigService,
    private readonly userSessionRepository: UserSessionRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  async generateAccessToken(user: TUser, session: TSession) {
    const payload = {
      sub: user.id,
      sessionId: session.id,
      role: 'user',
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.jwtUserAccessSecret,
      expiresIn: this.configService.jwtUserAccessExp as any,
    });
  }

  async generateRefreshToken(user: TUser, session: TSession) {
    const payload = {
      sub: user.id,
      sessionId: session.id,
      role: 'user',
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.jwtUserRefreshSecret,
      expiresIn: this.configService.jwtUserRefreshExp as any,
    });
  }

  async refreshTokens(
    currentRefreshToken: string,
  ): Promise<RefreshTokenResult> {
    try {
      // 1. Verify refresh token
      const payload = await this.jwtService.verifyAsync(currentRefreshToken, {
        secret: this.configService.jwtUserRefreshSecret,
      });

      // 2. Fetch session from DB with user details
      const userSession =
        await this.userSessionRepository.findUserSessionDetailsBySessionId(
          payload.sessionId,
        );

      if (!userSession) {
        throw new UnauthorizedException('Invalid session');
      }

      // 3. Check session revoked/expired
      if (userSession.session.revoked || userSession.session.logoutAt) {
        throw new UnauthorizedException('Session revoked or expired');
      }

      // 4. Check if session is expired
      const isExpired = new Date() > new Date(userSession.session.expiresAt);
      if (isExpired) {
        throw new UnauthorizedException('Session expired');
      }

      // 5. Generate new session ID (rotation) - this invalidates old refresh token
      const newSessionId = crypto.randomUUID();

      // 6. Update session with new ID and extended expiry
      const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
      await this.drizzle.client
        .update(sessionTable)
        .set({
          id: newSessionId,
          expiresAt: newExpiresAt,
          updatedAt: new Date(),
        })
        .where(eq(sessionTable.id, userSession.session.id));

      // 7. Generate new access token with new session ID
      const newAccessToken = await this.generateAccessToken(userSession.user, {
        ...userSession.session,
        id: newSessionId,
        expiresAt: newExpiresAt,
      });

      // 8. Generate new refresh token with new session ID
      const newRefreshToken = await this.generateRefreshToken(
        userSession.user,
        { ...userSession.session, id: newSessionId, expiresAt: newExpiresAt },
      );

      return {
        tokens: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
        user: userSession.user,
        session: {
          ...userSession.session,
          id: newSessionId,
          expiresAt: newExpiresAt,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
