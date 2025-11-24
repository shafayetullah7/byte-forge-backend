import { SQL, eq } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { BaseRepository } from '../_base/base.repository';
import { cloudinaryMediaTable } from '@/_db/drizzle/schema';
import { Injectable } from '@nestjs/common';

export interface CloudinaryMediaQuery {
  id?: string;
  mediaId?: string;
  publicKey?: string;
}

@Injectable()
export class CloudinaryMediaRepository extends BaseRepository<
  typeof cloudinaryMediaTable,
  CloudinaryMediaQuery
> {
  constructor(db: DrizzleService) {
    super(db, cloudinaryMediaTable);
  }

  protected buildWhere(options?: CloudinaryMediaQuery): SQL[] {
    if (!options) return [];

    const where: SQL[] = [];

    if (options.id) where.push(eq(cloudinaryMediaTable.id, options.id));
    if (options.mediaId)
      where.push(eq(cloudinaryMediaTable.mediaId, options.mediaId));
    if (options.publicKey)
      where.push(eq(cloudinaryMediaTable.publicKey, options.publicKey));

    return where;
  }
}
