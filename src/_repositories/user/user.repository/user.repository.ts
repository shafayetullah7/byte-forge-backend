import { SQL, eq } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { BaseRepository } from '../../_base/base.repository';
import { userTable } from '@/_db/drizzle/schema';
import { Injectable } from '@nestjs/common';

export interface UserQuery {
  id?: string;
  userName?: string;
  firstName?: string;
  lastName?: string;
}

@Injectable()
export class UserRepository extends BaseRepository<
  typeof userTable,
  UserQuery
> {
  constructor(db: DrizzleService) {
    super(db, userTable);
  }

  protected buildWhere(options?: UserQuery): SQL[] {
    if (!options) return [];

    const where: SQL[] = [];

    if (options.id) where.push(eq(userTable.id, options.id));
    if (options.userName) where.push(eq(userTable.userName, options.userName));
    if (options.firstName)
      where.push(eq(userTable.firstName, options.firstName));
    if (options.lastName) where.push(eq(userTable.lastName, options.lastName));

    return where;
  }
}
