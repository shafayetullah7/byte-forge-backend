import { Injectable } from '@nestjs/common';
import {
  IMediaRepository,
  TUserMediaQueryOption,
  TUserMediaQueryResult,
} from './interfaces/media.repository.interface';
import {
  cloudinaryMediaTable,
  mediaTable,
  TNewMedia,
  userUploadMediaTable,
} from '@/_db/drizzle/schema';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import {
  and,
  eq,
  getTableColumns,
  inArray,
  isNull,
  not,
  SQL,
} from 'drizzle-orm';

@Injectable()
export class MediaRepository implements IMediaRepository {
  constructor(private readonly db: DrizzleService) {}

  private getExecutor(tx?: PgTransaction<any, any, any>) {
    return tx ?? this.db.client;
  }

  async createMedia(
    media: TNewMedia,
    userId: string,
    tx?: PgTransaction<any, any, any>,
  ): Promise<TNewMedia> {
    const executor = this.getExecutor(tx);

    const operation = async (t: typeof executor) => {
      const [created] = await t.insert(mediaTable).values(media).returning();
      await t
        .insert(userUploadMediaTable)
        .values({ mediaId: created.id, userId });
      return created;
    };

    return tx ? operation(executor) : this.db.transaction(operation);
  }

  async deleteMedia(
    mediaId: string,
    tx?: PgTransaction<any, any, any>,
  ): Promise<void> {
    const executor = this.getExecutor(tx);

    const operation = async (t: typeof executor) => {
      await t
        .delete(cloudinaryMediaTable)
        .where(eq(cloudinaryMediaTable.mediaId, mediaId));
      await t.delete(mediaTable).where(eq(mediaTable.id, mediaId));
    };

    return tx ? operation(executor) : this.db.transaction(operation);
  }

  async findUserMedia(
    options: TUserMediaQueryOption,
  ): Promise<TUserMediaQueryResult[]> {
    const { userId, used, mediaIds, transactionInfo = {} } = options;
    const { lock, transaction } = transactionInfo;

    const executor = this.getExecutor(transaction);

    const conditions: SQL[] = [];
    if (userId) conditions.push(eq(userUploadMediaTable.userId, userId));
    if (mediaIds?.length) conditions.push(inArray(mediaTable.id, mediaIds));
    if (typeof used === 'boolean')
      conditions.push(
        used ? not(isNull(mediaTable.usedAt)) : isNull(mediaTable.usedAt),
      );

    const query = executor
      .select({
        ...getTableColumns(mediaTable),
        userId: userUploadMediaTable.userId,
      })
      .from(mediaTable)
      .innerJoin(
        userUploadMediaTable,
        eq(mediaTable.id, userUploadMediaTable.mediaId),
      )
      .where(and(...conditions));

    const results = await (lock ? query.for('update') : query).execute();

    return results;
  }

  async findMediaById(
    mediaId: string,
    userId: string,
    tx?: PgTransaction<any, any, any>,
  ): Promise<any> {
    const executor = tx ?? this.db.client;

    const [media] = await executor
      .select({
        media: getTableColumns(mediaTable),
        userUploadMedia: getTableColumns(userUploadMediaTable),
        cloudinaryMedia: getTableColumns(cloudinaryMediaTable),
      })
      .from(mediaTable)
      .leftJoin(
        cloudinaryMediaTable,
        eq(mediaTable.id, cloudinaryMediaTable.mediaId),
      )
      .innerJoin(
        userUploadMediaTable,
        eq(mediaTable.id, userUploadMediaTable.mediaId),
      )
      .where(
        and(
          eq(mediaTable.id, mediaId),
          eq(userUploadMediaTable.userId, userId),
        ),
      )
      .execute();

    return media;
  }
}
