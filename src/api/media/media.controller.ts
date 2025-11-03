import {
  Controller,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { Request } from 'express';
import { AuthenticUser } from '@/common/types';
import { UserAuthGuard } from '@/common/guards/user-auth.guard';
import { AuthenticUserParam } from '@/common/pipes/authentic-user.pipe';

const allowedMimeTypes = [
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',

  // Videos
  'video/mp4',
  'video/webm',
  'video/ogg',

  // Audio
  'audio/mpeg', // mp3
  'audio/wav',
  'audio/ogg',
  'audio/webm',

  // Documents
  'application/pdf', // PDF
  'application/msword', // DOC
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
  'application/vnd.ms-excel', // XLS
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
  'application/vnd.ms-powerpoint', // PPT
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPTX
  'text/plain', // TXT
];

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  /**
   * Upload a single file with file type and size restrictions
   */
  @Post('upload')
  @UseGuards(UserAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
      fileFilter: (req, file, callback) => {
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return callback(
            new BadRequestException(
              `File type ${file.mimetype} is not allowed`,
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @AuthenticUserParam() authenticUser: AuthenticUser,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const media = await this.mediaService.saveFile({
      file,
      authenticUser,
    });

    return {
      status: HttpStatus.CREATED,
      message: 'File uploaded successfully',
      data: media,
    };
  }

  /**
   * Delete a media file by ID
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMedia(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<void> {
    const user = req.user as AuthenticUser;
    await this.mediaService.deleteMedia(id, user);
  }
}
