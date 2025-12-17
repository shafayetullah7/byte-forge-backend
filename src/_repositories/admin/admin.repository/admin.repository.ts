import { SQL, eq } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { BaseRepository } from '../../_base/base.repository';
import { adminTable } from '@/_db/drizzle/schema';
import { Injectable } from '@nestjs/common';

export interface AdminQuery {
  id?: string;
  userName?: string;
  firstName?: string;
  lastName?: string;
}

@Injectable()
export class AdminRepository extends BaseRepository<
  typeof adminTable,
  AdminQuery
> {
  constructor(db: DrizzleService) {
    super(db, adminTable);
  }

  protected buildWhere(options?: AdminQuery): SQL[] {
    if (!options) return [];

    const where: SQL[] = [];

    if (options.id) where.push(eq(adminTable.id, options.id));
    if (options.userName) where.push(eq(adminTable.userName, options.userName));
    if (options.firstName)
      where.push(eq(adminTable.firstName, options.firstName));
    if (options.lastName) where.push(eq(adminTable.lastName, options.lastName));

    return where;
  }
}
