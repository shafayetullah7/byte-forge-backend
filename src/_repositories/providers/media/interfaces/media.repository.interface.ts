import { TMedia, TNewMedia, TUserUploadMedia } from '@/_db/drizzle/schema';
import { PgTransaction } from 'drizzle-orm/pg-core';

export type TUserMediaQueryOption = {
  userId?: string;
  used?: boolean;
  mediaIds?: string[];
  transactionInfo?: {
    transaction?: PgTransaction<any, any, any>;
    lock?: boolean;
  };
};

export type TUserMediaQueryResult = TMedia & Pick<TUserUploadMedia, 'userId'>;

export interface IMediaRepository {
  createMedia(
    payload: {
      media: TNewMedia;
      cloudinary?: { publicKey: string };
      userId: string;
    },
    tx?: PgTransaction<any, any, any>,
  ): Promise<any>;
  deleteMedia(
    mediaId: string,
    tx?: PgTransaction<any, any, any>,
  ): Promise<void>;
  findUserMedia(
    options: TUserMediaQueryOption,
  ): Promise<TUserMediaQueryResult[]>;
  findMediaById(
    mediaId: string,
    userId: string,
    transaction: {
      tx: PgTransaction<any, any, any>;
      lock: boolean;
    },
  ): Promise<any>;
}
