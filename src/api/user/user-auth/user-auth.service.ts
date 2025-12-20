import { Injectable } from '@nestjs/common';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { UserAuth } from './types/user-auth.type';
import { CreateLocalUserDto } from './dto/create-local-user.dto';
import { UserLocalAuthService } from './user-local-auth.service';
import { UserService } from '../user/user.service';
import { DeviceInfo, TSession } from '@/_db/drizzle/schema';
import { UserSessionRepository } from '@/_repositories/auth/user-session-repository/user-session-repository.service';
import { SessionRepository } from '@/_repositories/auth/session.repository/session.repository';
import { UserLocalAuthSessionRepositoryService } from '@/_repositories/auth/user-local-auth-session-repository/user-local-auth-session-repository.service';

@Injectable()
export class UserAuthService {
  constructor(
    private readonly drizzle: DrizzleService,
    private readonly userLocalAuthService: UserLocalAuthService,
    private readonly userService: UserService,
    private readonly userSessionRepository: UserSessionRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly userLocalAuthSessionRepository: UserLocalAuthSessionRepositoryService,
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
}
