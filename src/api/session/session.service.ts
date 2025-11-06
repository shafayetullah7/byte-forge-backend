import { Injectable } from '@nestjs/common';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { sessionTable, TNewSession } from '@/_db/drizzle/schema';
import { DrizzlePgTransaction } from '@/_db/drizzle/types';

@Injectable()
export class SessionService {
  constructor(private readonly drizzle: DrizzleService) {}

  async createSession(payload: TNewSession, tx?: DrizzlePgTransaction) {
    const db = tx || this.drizzle.client;
    const [newSession] = await db
      .insert(sessionTable)
      .values(payload)
      .returning()
      .execute();

    return newSession;
  }
}
