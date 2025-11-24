import { SQL, eq } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { BaseRepository } from '../_base/base.repository';
import { adminLocalAuthSessionTable } from '@/_db/drizzle/schema';
import { Injectable } from '@nestjs/common';

export interface AdminLocalAuthSessionQuery {
  id?: string;
  sessionId?: string;
  localAuthId?: string;
}

@Injectable()
export class AdminLocalAuthSessionRepository extends BaseRepository<
  typeof adminLocalAuthSessionTable,
  AdminLocalAuthSessionQuery
> {
  constructor(db: DrizzleService) {
    super(db, adminLocalAuthSessionTable);
  }

  protected buildWhere(options?: AdminLocalAuthSessionQuery): SQL[] {
    if (!options) return [];

    const where: SQL[] = [];

    if (options.id) where.push(eq(adminLocalAuthSessionTable.id, options.id));
    if (options.sessionId)
      where.push(eq(adminLocalAuthSessionTable.sessionId, options.sessionId));
    if (options.localAuthId)
      where.push(
        eq(adminLocalAuthSessionTable.localAuthId, options.localAuthId),
      );

    return where;
  }
}
