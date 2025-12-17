import { SQL, eq } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { BaseRepository } from '../../_base/base.repository';
import { adminLocalAuthTable } from '@/_db/drizzle/schema';
import { Injectable } from '@nestjs/common';

export interface AdminLocalAuthQuery {
  adminId?: string;
  email?: string;
  verified?: boolean;
}

@Injectable()
export class AdminLocalAuthRepository extends BaseRepository<
  typeof adminLocalAuthTable,
  AdminLocalAuthQuery
> {
  constructor(db: DrizzleService) {
    super(db, adminLocalAuthTable);
  }

  protected buildWhere(options?: AdminLocalAuthQuery): SQL[] {
    if (!options) return [];

    const where: SQL[] = [];

    if (options.adminId)
      where.push(eq(adminLocalAuthTable.adminId, options.adminId));
    if (options.email) where.push(eq(adminLocalAuthTable.email, options.email));
    if (options.verified !== undefined)
      where.push(eq(adminLocalAuthTable.verfied, options.verified));

    return where;
  }
}
