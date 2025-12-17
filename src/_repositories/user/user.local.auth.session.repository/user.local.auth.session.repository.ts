import { SQL, eq } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { BaseRepository } from '../../_base/base.repository';
import { userLocalAuthSessionTable } from '@/_db/drizzle/schema';
import { Injectable } from '@nestjs/common';

export interface UserLocalAuthSessionQuery {
  id?: string;
  sessionId?: string;
  localAuthId?: string;
}

@Injectable()
export class UserLocalAuthSessionRepository extends BaseRepository<
  typeof userLocalAuthSessionTable,
  UserLocalAuthSessionQuery
> {
  constructor(db: DrizzleService) {
    super(db, userLocalAuthSessionTable);
  }

  protected buildWhere(options?: UserLocalAuthSessionQuery): SQL[] {
    if (!options) return [];

    const where: SQL[] = [];

    if (options.id) where.push(eq(userLocalAuthSessionTable.id, options.id));
    if (options.sessionId)
      where.push(eq(userLocalAuthSessionTable.sessionId, options.sessionId));
    if (options.localAuthId)
      where.push(
        eq(userLocalAuthSessionTable.localAuthId, options.localAuthId),
      );

    return where;
  }
}
