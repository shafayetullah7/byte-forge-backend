import { SQL, eq } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { BaseRepository } from '../_base/base.repository';
import { userSessionTable } from '@/_db/drizzle/schema';
import { Injectable } from '@nestjs/common';

export interface UserSessionQuery {
  id?: string;
  userId?: string;
  sessionId?: string;
}

@Injectable()
export class UserSessionRepository extends BaseRepository<
  typeof userSessionTable,
  UserSessionQuery
> {
  constructor(db: DrizzleService) {
    super(db, userSessionTable);
  }

  protected buildWhere(options?: UserSessionQuery): SQL[] {
    if (!options) return [];

    const where: SQL[] = [];

    if (options.id) where.push(eq(userSessionTable.id, options.id));
    if (options.userId) where.push(eq(userSessionTable.userId, options.userId));
    if (options.sessionId)
      where.push(eq(userSessionTable.sessionId, options.sessionId));

    return where;
  }
}
