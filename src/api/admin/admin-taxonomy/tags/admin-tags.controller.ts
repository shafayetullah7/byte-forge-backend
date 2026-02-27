import { Controller, Get, Body, Patch, Param, Delete, Post, UseGuards } from '@nestjs/common';
import { AdminTagsService } from './services/admin-tags.service';
import { AdminTagTranslationsService } from './services/admin-tag-translations.service';

import { UpdateTagDto } from './dto/update-tag.dto';
import { TagParamDto } from './dto/tag-param.dto';

import { UpsertTagTranslationDto } from './dto/upsert-tag-translation.dto';
import { TagTranslationParamDto } from './dto/tag-translation-param.dto';

import { AdminAuthGuard } from '@/common/guards/admin-auth-guard/admin-auth.guard';
import { ResponseService } from '@/common/modules/response/response.service';

@UseGuards(AdminAuthGuard)
@Controller('admin/tags')
export class AdminTagsController {
  constructor(
    private readonly tagsService: AdminTagsService,
    private readonly tagTranslationsService: AdminTagTranslationsService,
    private readonly responseService: ResponseService,
  ) {}

  @Get(':tagId')
  async findOne(@Param() param: TagParamDto) {
    const data = await this.tagsService.findOne(param.tagId);
    return this.responseService.success({ message: 'Tag retrieved successfully', data });
  }

  @Patch(':tagId')
  async update(
    @Param() param: TagParamDto, 
    @Body() updateTagDto: UpdateTagDto
  ) {
    const data = await this.tagsService.update(param.tagId, updateTagDto);
    return this.responseService.success({ message: 'Tag updated successfully', data });
  }

  @Delete(':tagId')
  async remove(@Param() param: TagParamDto) {
    await this.tagsService.remove(param.tagId);
    return this.responseService.success({ message: 'Tag removed successfully', data: null });
  }

  // --- TAG TRANSLATION SUB-RESOURCES ---

  @Get(':tagId/translations')
  async findAllTagTranslations(@Param() param: TagParamDto) {
    const data = await this.tagTranslationsService.findAllByTag(param.tagId);
    return this.responseService.success({ data, message: 'Tag translations retrieved successfully' });
  }

  @Post(':tagId/translations')
  async upsertTagTranslation(
    @Param() param: TagParamDto, 
    @Body() upsertDto: UpsertTagTranslationDto
  ) {
    const data = await this.tagTranslationsService.upsert(param.tagId, upsertDto);
    return this.responseService.success({ data, message: 'Tag translation saved successfully' });
  }

  @Delete(':tagId/translations/:locale')
  async removeTagTranslation(@Param() param: TagTranslationParamDto) {
    await this.tagTranslationsService.remove(param.tagId, param.locale);
    return this.responseService.success({ data: null, message: 'Tag translation deleted successfully' });
  }
}
