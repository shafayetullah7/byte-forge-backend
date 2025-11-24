import { SQL, eq } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { BaseRepository } from '../_base/base.repository';
import { userLocalAuthTable } from '@/_db/drizzle/schema';
import { Injectable } from '@nestjs/common';

export interface UserLocalAuthQuery {
  id?: string;
  userId?: string;
  email?: string;
  verified?: boolean;
}

@Injectable()
export class UserLocalAuthRepository extends BaseRepository<
  typeof userLocalAuthTable,
  UserLocalAuthQuery
> {
  constructor(db: DrizzleService) {
    super(db, userLocalAuthTable);
  }

  protected buildWhere(options?: UserLocalAuthQuery): SQL[] {
    if (!options) return [];

    const where: SQL[] = [];

    if (options.id) where.push(eq(userLocalAuthTable.id, options.id));
    if (options.userId)
      where.push(eq(userLocalAuthTable.userId, options.userId));
    if (options.email) where.push(eq(userLocalAuthTable.email, options.email));
    if (options.verified !== undefined)
      where.push(eq(userLocalAuthTable.verified, options.verified));

    return where;
  }
}
