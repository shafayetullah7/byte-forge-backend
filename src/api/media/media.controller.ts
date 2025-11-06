import {
  Controller,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UseGuards,
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { Request } from 'express';
import { AuthenticUser } from '@/common/types';
import { UserAuthGuard } from '@/common/guards/user-auth.guard';
import { AuthenticUserParam } from '@/common/pipes/authentic-user.pipe';
import { DeleteMediaDto } from './dto/delete.media.dto';

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
  @UseGuards(UserAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMedia(
    @Param() params: DeleteMediaDto,
    @AuthenticUserParam() authenticUser: AuthenticUser,
  ): Promise<void> {
    console.log('inside delete media controller');
    await this.mediaService.deleteMedia(params.id, authenticUser);
  }

  @Get()
  @UseGuards(UserAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getMedia(@AuthenticUserParam() authenticUser: AuthenticUser) {
    console.log('inside delete media controller');
    const result = await this.mediaService.getAllMedia(authenticUser);
    return result;
  }
}
