import { Injectable } from '@nestjs/common';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { CreateAdminSession } from './types';
import { SessionService } from '@/api/session/session.service';
import {
  adminLocalAuthSessionTable,
  adminSessionTable,
  TNewAdminSession,
} from '@/_db/drizzle/schema';

@Injectable()
export class AdminSessionService {
  constructor(
    private readonly drizzle: DrizzleService,
    private readonly sessionService: SessionService,
  ) {}

  async createAdminAuthSession(payload: CreateAdminSession) {
    const {
      deviceInfo,
      ip,
      adminAuth: { admin, adminLocalAuth },
    } = payload;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

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
      const adminSessionData: TNewAdminSession = {
        adminId: admin.id,
        sessionId: newSession.id,
      };

      await tx.insert(adminSessionTable).values(adminSessionData).execute();

      if (adminLocalAuth) {
        await tx
          .insert(adminLocalAuthSessionTable)
          .values({
            sessionId: newSession.id,
            localAuthId: adminLocalAuth.adminId,
          })
          .execute();
      }

      return newSession;
    });

    return result;
  }
}
