import { Injectable } from '@nestjs/common';
import { DrizzleService } from '@/drizzle/drizzle.service';
import { UserAuth } from '../user-auth/types/user-auth.type';
import {
  DeviceInfo,
  sessionTable,
  TSession,
  TUser,
  userLocalAuthSessionTable,
  userSessionTable,
  userTable,
} from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { SessionService } from '@/api/session/session.service';

@Injectable()
export class UserSessionService {
  constructor(
    private readonly drizzle: DrizzleService,
    private readonly sessionService: SessionService,
  ) {}

  async createAuthSession(payload: {
    userAuth: UserAuth;
    deviceInfo: DeviceInfo;
    ip: string;
  }) {
    const { userAuth, deviceInfo, ip } = payload;
    const { user } = userAuth;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // now + 7 days

    const sessionData = {
      deviceInfo,
      ip,
      expiresAt,
    };

    const result = await this.drizzle.client.transaction(async (tx) => {
      const newSession = await this.sessionService.createSession(
        sessionData,
        tx,
      );
      const userSessionData = { sessionId: newSession.id, userId: user.id };
      await tx.insert(userSessionTable).values(userSessionData).execute();

      if (userAuth.userLocalAuth) {
        await tx.insert(userLocalAuthSessionTable).values({
          sessionId: newSession.id,
          localAuthId: userAuth.userLocalAuth.userId,
        });
      }
      return newSession;
    });

    return result;
  }

  async getUserSession(
    sessionId: string,
  ): Promise<{ user: TUser; session: TSession } | null> {
    const [userSession] = await this.drizzle.client
      .select({
        user: userTable,
        session: sessionTable,
      })
      .from(userTable)
      .innerJoin(userSessionTable, eq(userTable.id, userSessionTable.userId))
      .innerJoin(sessionTable, eq(sessionTable.id, userSessionTable.sessionId))
      .where(eq(sessionTable.id, sessionId))
      .execute();

    return userSession;
  }

  isSessionActive(payload: { user: TUser; session: TSession }) {
    if (!payload) return false;
    if (!payload.session) return false;

    const now = new Date();
    return (
      !payload.session.revoked &&
      payload.session.logoutAt === null &&
      payload.session.expiresAt > now
    );
  }
}
