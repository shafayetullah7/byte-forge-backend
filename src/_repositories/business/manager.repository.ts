import { SQL, eq } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { BaseRepository } from '../_base/base.repository';
import { managerTable } from '@/_db/drizzle/schema';
import { Injectable } from '@nestjs/common';

export interface ManagerQuery {
  id?: string;
  userId?: string;
  verified?: boolean;
  phone?: string;
}

@Injectable()
export class ManagerRepository extends BaseRepository<
  typeof managerTable,
  ManagerQuery
> {
  constructor(db: DrizzleService) {
    super(db, managerTable);
  }

  protected buildWhere(options?: ManagerQuery): SQL[] {
    if (!options) return [];

    const where: SQL[] = [];

    if (options.id) where.push(eq(managerTable.id, options.id));
    if (options.userId) where.push(eq(managerTable.userId, options.userId));
    if (options.verified !== undefined)
      where.push(eq(managerTable.verified, options.verified));
    if (options.phone) where.push(eq(managerTable.phone, options.phone));

    return where;
  }
}
