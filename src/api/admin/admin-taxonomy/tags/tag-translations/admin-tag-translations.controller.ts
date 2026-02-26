import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { AdminTagTranslationsService } from './admin-tag-translations.service';
import { UpsertTagTranslationDto } from './dto/upsert-tag-translation.dto';
import { ResponseService } from '@/common/modules/response/response.service';

@Controller('admin/tags/:tagId/translations')
export class AdminTagTranslationsController {
  constructor(
    private readonly translationsService: AdminTagTranslationsService,
    private readonly responseService: ResponseService,
  ) {}

  @Get()
  async findAll(@Param('tagId') tagId: string) {
    const data = await this.translationsService.findAllByTag(tagId);
    return this.responseService.success({ data, message: 'Tag translations retrieved successfully' });
  }

  @Post()
  async upsert(
    @Param('tagId') tagId: string, 
    @Body() upsertDto: UpsertTagTranslationDto
  ) {
    const data = await this.translationsService.upsert(tagId, upsertDto);
    return this.responseService.success({ data, message: 'Tag translation saved successfully' });
  }

  @Delete(':locale')
  async remove(@Param('tagId') tagId: string, @Param('locale') locale: string) {
    await this.translationsService.remove(tagId, locale);
    return this.responseService.success({ data: null, message: 'Tag translation deleted successfully' });
  }
}
