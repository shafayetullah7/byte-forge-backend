import { CloudinaryService } from '@/common/modules/cloudinary/cloudinary.service';
import { AppLoggerService } from '@/common/modules/logger/app.logger.service';
import { AuthenticUser } from '@/common/types';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import {
  cloudinaryMediaTable,
  mediaTable,
  TNewMedia,
  userUploadMediaTable,
} from '@/_db/drizzle/schema';
import { ForbiddenError } from '@nestjs/apollo';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UploadApiResponse } from 'cloudinary';
import {
  and,
  eq,
  getTableColumns,
  inArray,
  isNull,
  not,
  SQL,
} from 'drizzle-orm';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { MediaRepository } from '@/_repositories/providers/media/media.repository';
import { MimeType } from '@/_db/drizzle/enum/mime.type.enum';

type QueryOptions = {
  userId?: string;
  used?: boolean;
  mediaIds?: string[];
  transactionInfo?: {
    transaction?: PgTransaction<any, any, any>;
    lock?: boolean;
  };
};

@Injectable()
export class MediaService {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly mediaRepository: MediaRepository,
    private readonly db: DrizzleService,
    private readonly logger: AppLoggerService,
  ) {}

  async saveFile(payload: {
    file: Express.Multer.File;
    authenticUser: AuthenticUser;
    folder?: string;
  }) {
    const { file, authenticUser, folder } = payload;

    let cloudinaryUpload: UploadApiResponse;
    try {
      cloudinaryUpload = await this.cloudinaryService.uploadFile(file, folder);
    } catch (e) {
      this.logger.error(`could not upload Cloudinary file`, e);
      throw new InternalServerErrorException(
        'Failed to upload file to Cloudinary',
      );
    }

    try {
      const mediaData: TNewMedia = {
        fileName: file.originalname,
        mimeType: file.mimetype as MimeType,
        size: file.size,
        url: cloudinaryUpload.secure_url,
      };
      const media = await this.db.client.transaction(async (tx) => {
        const createdMedia = await this.mediaRepository.createMedia(
          {
            media: mediaData,
            userId: authenticUser.user.id,
            cloudinary: {
              publicKey: cloudinaryUpload.public_id,
            },
          },
          tx,
        );
        return createdMedia;
      });

      return media;
    } catch (e) {
      this.logger.error(
        `could not upload Cloudinary file ${cloudinaryUpload.public_id}`,
        e,
      );
      try {
        await this.cloudinaryService.deleteFile(cloudinaryUpload.public_id);
        this.logger.warn(
          `Rolled back Cloudinary file: ${cloudinaryUpload.public_id}`,
        );
      } catch (deleteError) {
        this.logger.error(
          `Rollback failed — could not delete Cloudinary file ${cloudinaryUpload.public_id}`,
          deleteError,
        );
      }

      throw new InternalServerErrorException(
        'Failed to save file record in database',
      );
    }
  }

  async deleteMedia(
    mediaId: string,
    authenticUser: AuthenticUser,
  ): Promise<void> {
    try {
      await this.db.client.transaction(async (tx) => {
        const mediaRecord = await this.mediaRepository.findMediaById(
          mediaId,
          authenticUser.user.id,
          { tx, lock: true },
        );

        if (!mediaRecord) {
          throw new NotFoundException('Media not found in Cloudinary records');
        }
        if (mediaRecord.media.usedAt != null) {
          throw new ForbiddenError('File is already in use');
        }
        const { media, cloudinaryMedia } = mediaRecord;
        await this.mediaRepository.deleteMedia(media.id, tx);

        if (cloudinaryMedia?.id) {
          await this.cloudinaryService.deleteFile(cloudinaryMedia.publicKey);
        }
      });
    } catch (error) {
      this.logger.error('Failed to delete media resource', error);
      throw new InternalServerErrorException('Failed to delete media resource');
    }
  }

  async getAllMedia(authenticUser: AuthenticUser) {
    const mediaRecords = await this.db.client
      .select({
        media: getTableColumns(mediaTable),
        userUploadMedia: getTableColumns(userUploadMediaTable),
        cloudinaryMedia: getTableColumns(cloudinaryMediaTable),
      })
      .from(mediaTable)
      .innerJoin(
        userUploadMediaTable,
        eq(mediaTable.id, userUploadMediaTable.mediaId),
      )
      .leftJoin(
        cloudinaryMediaTable,
        eq(mediaTable.id, cloudinaryMediaTable.mediaId),
      )
      .where(eq(userUploadMediaTable.userId, authenticUser.user.id));

    return mediaRecords;
  }

  async getUserMedia(queryOptions: QueryOptions) {
    const { transactionInfo = {}, used, userId, mediaIds } = queryOptions;
    const { transaction, lock } = transactionInfo;

    const executor = transaction || this.db.client;

    const conditions: SQL[] = [];

    if (mediaIds?.length) {
      conditions.push(inArray(mediaTable.id, mediaIds));
    }
    if (userId) {
      conditions.push(eq(userUploadMediaTable.userId, userId));
    }
    if (used !== undefined) {
      if (used) {
        conditions.push(not(isNull(mediaTable.usedAt)));
      } else {
        conditions.push(isNull(mediaTable.usedAt));
      }
    }
    const query = executor
      .select({
        media: getTableColumns(mediaTable),
        userUploadMedia: getTableColumns(userUploadMediaTable),
      })
      .from(mediaTable)
      .innerJoin(
        userUploadMediaTable,
        eq(mediaTable.id, userUploadMediaTable.mediaId),
      )
      .where(and(...conditions));

    if (lock) {
      query.for('update');
    }

    const mediaRecords = await query.execute();
    return mediaRecords;
  }
}
