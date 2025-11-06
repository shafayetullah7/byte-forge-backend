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
import { and, eq, getTableColumns } from 'drizzle-orm';

@Injectable()
export class MediaService {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
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
        mimeType: file.mimetype,
        size: file.size,
        url: cloudinaryUpload.secure_url,
      };
      const media = await this.db.client.transaction(async (tx) => {
        const [createdMedia] = await tx
          .insert(mediaTable)
          .values(mediaData)
          .returning();

        await tx
          .insert(userUploadMediaTable)
          .values({ mediaId: createdMedia.id, userId: authenticUser.user.id });

        await tx.insert(cloudinaryMediaTable).values({
          mediaId: createdMedia.id,
          publicKey: cloudinaryUpload.public_id,
        });
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
    const [mediaRecord] = await this.db.client
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
          eq(userUploadMediaTable.userId, authenticUser.user.id),
          eq(mediaTable.id, mediaId),
        ),
      );

    if (!mediaRecord) {
      throw new NotFoundException('Media not found in Cloudinary records');
    }
    if (mediaRecord.media.usedAt != null) {
      throw new ForbiddenError('File is already in use');
    }

    try {
      await this.db.client.transaction(async (tx) => {
        await tx
          .delete(cloudinaryMediaTable)
          .where(eq(cloudinaryMediaTable.mediaId, mediaId));
        await tx.delete(mediaTable).where(eq(mediaTable.id, mediaId));

        if (mediaRecord.cloudinaryMedia?.id) {
          await this.cloudinaryService.deleteFile(
            mediaRecord.cloudinaryMedia.publicKey,
          );
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
}
