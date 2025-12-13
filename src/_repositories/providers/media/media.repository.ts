import { Injectable } from '@nestjs/common';
import {
  IMediaRepository,
  TUserMediaQueryOption,
  TUserMediaQueryResult,
} from './interfaces/media.repository.interface';
import {
  cloudinaryMediaTable,
  mediaTable,
  TCloudinaryMedia,
  TMedia,
  TNewMedia,
  TUserUploadMedia,
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
import { DrizzleTx } from '@/_db/drizzle/types';
import { TAllowedMimeType } from '@/_db/drizzle/enum';

type SingleMedia = {
  media: TMedia;
  userUploadMedia: TUserUploadMedia;
  cloudinaryMedia: TCloudinaryMedia | null;
};

@Injectable()
export class MediaRepository implements IMediaRepository {
  constructor(private readonly db: DrizzleService) {}

  private getExecutor(tx?: DrizzleTx) {
    return tx ?? this.db.client;
  }

  async createMedia(
    payload: {
      media: TNewMedia;
      cloudinary?: { publicKey: string };
      userId: string;
    },
    tx: DrizzleTx,
  ): Promise<TNewMedia> {
    const { media, userId, cloudinary } = payload;
    const executor = this.getExecutor(tx);

    const operation = async (t: typeof executor) => {
      const [createdMedia] = await t
        .insert(mediaTable)
        .values(media)
        .returning();
      await t
        .insert(userUploadMediaTable)
        .values({ mediaId: createdMedia.id, userId });
      if (cloudinary) {
        await t.insert(cloudinaryMediaTable).values({
          mediaId: createdMedia.id,
          publicKey: cloudinary?.publicKey,
        });
      }

      return createdMedia;
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
      await t
        .delete(userUploadMediaTable)
        .where(eq(userUploadMediaTable.mediaId, mediaId));

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

  async findMediaDetailsById(
    mediaId: string,
    transaction?: {
      tx: DrizzleTx;
      lock: boolean;
    },
  ): Promise<SingleMedia | null> {
    const executor = this.getExecutor(transaction?.tx);

    const query = executor
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
      .where(and(eq(mediaTable.id, mediaId)));

    const [media] = await (
      transaction?.lock ? query.for('update', { of: mediaTable }) : query
    ).execute();

    return media;
  }

  async findMediaDetailsByIds(
    mediaIds: string[],
    transaction?: {
      tx: DrizzleTx;
      lock: boolean;
    },
  ): Promise<SingleMedia[]> {
    if (mediaIds.length === 0) {
      return [];
    }

    const executor = this.getExecutor(transaction?.tx);

    const query = executor
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
      // --- KEY CHANGE: Use inArray to check against the list of IDs ---
      .where(inArray(mediaTable.id, mediaIds));

    const mediaRecords = await (
      transaction?.lock ? query.for('update', { of: mediaTable }) : query
    ).execute();

    return mediaRecords;
  }

  verifyMediaExistence(
    requestedIds: string[],
    mediaRecords: SingleMedia[],
  ): boolean {
    if (requestedIds.length !== mediaRecords.length) {
      return false;
    }

    const foundIdSet = new Set(mediaRecords.map((record) => record.media.id));

    for (const id of requestedIds) {
      if (!foundIdSet.has(id)) {
        return false;
      }
    }

    return true;
  }
  areMediaUsed(records: TMedia[]) {
    return records.some((record) => record.usedAt !== null);
  }

  async useMedia(mediaIds: string[], tx: DrizzleTx) {
    await tx
      .update(mediaTable)
      .set({ usedAt: new Date() })
      .where(inArray(mediaTable.id, mediaIds))
      .returning();
  }

  areValidMediaType(
    records: TMedia[],
    validTypes: TAllowedMimeType[],
  ): boolean {
    const uniqueMimeTypes = new Set(validTypes);
    return records.every((record) => uniqueMimeTypes.has(record.mimeType));
  }
}
