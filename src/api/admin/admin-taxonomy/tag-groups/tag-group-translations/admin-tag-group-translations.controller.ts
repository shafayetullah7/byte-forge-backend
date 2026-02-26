import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { AdminTagGroupTranslationsService } from './admin-tag-group-translations.service';
import { UpsertTagGroupTranslationDto } from './dto/upsert-tag-group-translation.dto';
import { ResponseService } from '@/common/modules/response/response.service';

@Controller('admin/tag-groups/:groupId/translations')
export class AdminTagGroupTranslationsController {
  constructor(
    private readonly translationsService: AdminTagGroupTranslationsService,
    private readonly responseService: ResponseService,
  ) {}

  @Get()
  async findAll(@Param('groupId') groupId: string) {
    const data = await this.translationsService.findAllByGroup(groupId);
    return this.responseService.success({ data, message: 'Tag Group translations retrieved successfully' });
  }

  @Post()
  async upsert(
    @Param('groupId') groupId: string, 
    @Body() upsertDto: UpsertTagGroupTranslationDto
  ) {
    const data = await this.translationsService.upsert(groupId, upsertDto);
    return this.responseService.success({ data, message: 'Tag Group translation saved successfully' });
  }

  @Delete(':locale')
  async remove(@Param('groupId') groupId: string, @Param('locale') locale: string) {
    await this.translationsService.remove(groupId, locale);
    return this.responseService.success({ data: null, message: 'Tag Group translation deleted successfully' });
  }
}
