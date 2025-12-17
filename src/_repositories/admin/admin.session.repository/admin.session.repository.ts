import { SQL, eq } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { BaseRepository } from '../../_base/base.repository';
import { adminSessionTable } from '@/_db/drizzle/schema';
import { Injectable } from '@nestjs/common';

export interface AdminSessionQuery {
  id?: string;
  adminId?: string;
  sessionId?: string;
}

@Injectable()
export class AdminSessionRepository extends BaseRepository<
  typeof adminSessionTable,
  AdminSessionQuery
> {
  constructor(db: DrizzleService) {
    super(db, adminSessionTable);
  }

  protected buildWhere(options?: AdminSessionQuery): SQL[] {
    if (!options) return [];

    const where: SQL[] = [];

    if (options.id) where.push(eq(adminSessionTable.id, options.id));
    if (options.adminId)
      where.push(eq(adminSessionTable.adminId, options.adminId));
    if (options.sessionId)
      where.push(eq(adminSessionTable.sessionId, options.sessionId));

    return where;
  }
}
