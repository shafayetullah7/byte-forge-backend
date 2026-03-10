import {
  Controller,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { Request } from 'express';
import { TAuthenticUser } from '@/common/types';
import { UserAuthGuard } from '@/common/guards/user-auth-guard/user-auth.guard';
import { AuthenticUser } from '@/common/decorators/authentic-user.decorator';
import { DeleteMediaDto } from './dto/delete.media.dto';
import {
  AllowedMimeType,
  TAllowedMimeType,
} from '@/_db/drizzle/enum/mime.type.enum';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { ResponseService } from '@/common/modules/response/response.service';
import { I18nLang, I18nService } from 'nestjs-i18n';

@ApiTags('Media')
@Controller({ path: 'media', version: '1' })
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly responseService: ResponseService,
    private readonly i18n: I18nService,
  ) {}

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post('upload')
  @UseGuards(UserAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 3 * 1024 * 1024 }, // 3MB limit
      fileFilter: (req, file, callback) => {
        if (
          !Object.values(AllowedMimeType).includes(
            file.mimetype as TAllowedMimeType,
          )
        ) {
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
    @AuthenticUser() authenticUser: TAuthenticUser,
    @I18nLang() lang: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const media = await this.mediaService.saveFile({
      file,
      authenticUser,
    });

    return this.responseService.success({
      message: this.i18n.t('message.success.mediaUploaded', { lang }),
      data: media,
    });
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a media file' })
  @ApiResponse({ status: 204, description: 'File deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'File not found' })
  @Delete(':id')
  @UseGuards(UserAuthGuard)
  async deleteMedia(
    @Param() params: DeleteMediaDto,
    @AuthenticUser() authenticUser: TAuthenticUser,
    @I18nLang() lang: string,
  ) {
    await this.mediaService.deleteMedia(params.id, authenticUser);
    return this.responseService.success({
      message: this.i18n.t('message.success.mediaDeleted', { lang }),
      data: null,
    });
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all media for current user' })
  @ApiResponse({ status: 200, description: 'Media list retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get()
  @UseGuards(UserAuthGuard)
  async getMedia(
    @AuthenticUser() authenticUser: TAuthenticUser,
    @I18nLang() lang: string,
  ) {
    const result = await this.mediaService.getAllMedia(authenticUser);
    return this.responseService.success({
      message: this.i18n.t('message.success.mediaRetrieved', { lang }),
      data: result,
    });
  }
}
