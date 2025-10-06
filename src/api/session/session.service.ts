import { Injectable } from '@nestjs/common';
import { DrizzleService } from '@/drizzle/drizzle.service';
import { sessionTable, TNewSession } from '@/drizzle/schema';
import { DrizzlePgTransaction } from '@/drizzle/types';

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
