import { SQL, eq, inArray } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { BaseRepository } from '../_base/base.repository';
import { mediaTable } from '@/_db/drizzle/schema';
import { MimeType } from '@/_db/drizzle/enum';
import { Injectable } from '@nestjs/common';

export interface MediaQuery {
  id?: string;
  fileName?: string;
  mimeType?: MimeType;
  url?: string;
  ids?: string[]; // filter multiple ids
}

@Injectable()
export class MediaRepository extends BaseRepository<
  typeof mediaTable,
  MediaQuery
> {
  constructor(db: DrizzleService) {
    super(db, mediaTable);
  }

  protected buildWhere(options?: MediaQuery): SQL[] {
    if (!options) return [];

    const where: SQL[] = [];

    if (options.id) where.push(eq(mediaTable.id, options.id));
    if (options.fileName) where.push(eq(mediaTable.fileName, options.fileName));
    if (options.mimeType) where.push(eq(mediaTable.mimeType, options.mimeType));
    if (options.url) where.push(eq(mediaTable.url, options.url));
    if (options.ids && options.ids.length)
      where.push(inArray(mediaTable.id, options.ids));

    return where;
  }
}
