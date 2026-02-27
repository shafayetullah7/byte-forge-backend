import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { AdminTagGroupsService } from './services/admin-tag-groups.service';
import { AdminTagGroupTranslationsService } from './services/admin-tag-group-translations.service';
import { AdminTagsService } from '../tags/services/admin-tags.service';

import { CreateTagGroupDto } from './dto/create-tag-group.dto';
import { UpdateTagGroupDto } from './dto/update-tag-group.dto';
import { TagGroupQueryDto } from './dto/tag-group-query.dto';
import { TagGroupParamDto } from './dto/tag-group-param.dto';

import { UpsertTagGroupTranslationDto } from './dto/upsert-tag-group-translation.dto';
import { TagGroupTranslationParamDto } from './dto/tag-group-translation-param.dto';

import { CreateTagDto } from '../tags/dto/create-tag.dto';
import { TagQueryDto } from '../tags/dto/tag-query.dto';

import { AdminAuthGuard } from '@/common/guards/admin-auth-guard/admin-auth.guard';
import { ResponseService } from '@/common/modules/response/response.service';

@UseGuards(AdminAuthGuard)
@Controller('admin/tag-groups')
export class AdminTagGroupsController {
  constructor(
    private readonly tagGroupsService: AdminTagGroupsService,
    private readonly tagGroupTranslationsService: AdminTagGroupTranslationsService,
    private readonly tagsService: AdminTagsService,
    private readonly responseService: ResponseService,
  ) {}

  @Post()
  async create(@Body() createTagGroupDto: CreateTagGroupDto) {
    const data = await this.tagGroupsService.create(createTagGroupDto);
    return this.responseService.success({
      message: 'Tag Group created successfully',
      data,
    });
  }

  @Get()
  async findAll(@Query() query: TagGroupQueryDto) {
    const list = await this.tagGroupsService.findAll(query);
    return this.responseService.paginated({
      message: 'Tag Groups retrieved successfully',
      data: list.data,
      meta: list.meta,
    });
  }

  @Get(':groupId')
  async findOne(@Param() param: TagGroupParamDto) {
    const data = await this.tagGroupsService.findOne(param.groupId);
    return this.responseService.success({
      message: 'Tag Group retrieved successfully',
      data,
    });
  }

  @Patch(':groupId')
  async update(@Param() param: TagGroupParamDto, @Body() updateTagGroupDto: UpdateTagGroupDto) {
    const data = await this.tagGroupsService.update(param.groupId, updateTagGroupDto);
    return this.responseService.success({
      message: 'Tag Group updated successfully',
      data,
    });
  }

  @Delete(':groupId')
  async remove(@Param() param: TagGroupParamDto) {
    await this.tagGroupsService.remove(param.groupId);
    return this.responseService.success({
      message: 'Tag Group removed successfully',
      data: null,
    });
  }

  // --- TAG GROUP TRANSLATION SUB-RESOURCES ---

  @Get(':groupId/translations')
  async findAllGroupTranslations(@Param() param: TagGroupParamDto) {
    const data = await this.tagGroupTranslationsService.findAllByGroup(param.groupId);
    return this.responseService.success({ data, message: 'Tag Group translations retrieved successfully' });
  }

  @Post(':groupId/translations')
  async upsertGroupTranslation(
    @Param() param: TagGroupParamDto, 
    @Body() upsertDto: UpsertTagGroupTranslationDto
  ) {
    const data = await this.tagGroupTranslationsService.upsert(param.groupId, upsertDto);
    return this.responseService.success({ data, message: 'Tag Group translation saved successfully' });
  }

  @Delete(':groupId/translations/:locale')
  async removeGroupTranslation(@Param() param: TagGroupTranslationParamDto) {
    await this.tagGroupTranslationsService.remove(param.groupId, param.locale);
    return this.responseService.success({ data: null, message: 'Tag Group translation deleted successfully' });
  }

  // --- TAGS SUB-RESOURCES ---

  @Post(':groupId/tags')
  async createTag(
    @Param() param: TagGroupParamDto, 
    @Body() createTagDto: CreateTagDto
  ) {
    // groupId is always sourced from the URL param; any body-level groupId is intentionally ignored
    const tagData: CreateTagDto = { ...createTagDto, groupId: param.groupId };
    const data = await this.tagsService.create(tagData);
    return this.responseService.success({ message: 'Tag created successfully', data });
  }

  @Get(':groupId/tags')
  async findAllTags(
    @Param() param: TagGroupParamDto, 
    @Query() query: TagQueryDto
  ) {
    query.groupId = param.groupId;
    const list = await this.tagsService.findAll(query);
    return this.responseService.paginated({ message: 'Tags retrieved successfully', data: list.data, meta: list.meta });
  }

}
