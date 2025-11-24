import { SQL, eq } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { BaseRepository } from '../_base/base.repository';
import { userUploadMediaTable } from '@/_db/drizzle/schema';
import { Injectable } from '@nestjs/common';

export interface UserUploadMediaQuery {
  id?: string;
  userId?: string;
  mediaId?: string;
}

@Injectable()
export class UserUploadMediaRepository extends BaseRepository<
  typeof userUploadMediaTable,
  UserUploadMediaQuery
> {
  constructor(db: DrizzleService) {
    super(db, userUploadMediaTable);
  }

  protected buildWhere(options?: UserUploadMediaQuery): SQL[] {
    if (!options) return [];

    const where: SQL[] = [];

    if (options.id) where.push(eq(userUploadMediaTable.id, options.id));
    if (options.userId)
      where.push(eq(userUploadMediaTable.userId, options.userId));
    if (options.mediaId)
      where.push(eq(userUploadMediaTable.mediaId, options.mediaId));

    return where;
  }
}
