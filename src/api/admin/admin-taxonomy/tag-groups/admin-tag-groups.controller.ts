import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { AdminTagGroupsService } from './admin-tag-groups.service';
import { CreateTagGroupDto } from './dto/create-tag-group.dto';
import { UpdateTagGroupDto } from './dto/update-tag-group.dto';
import { TagGroupQueryDto } from './dto/tag-group-query.dto';
import { TagGroupParamDto } from './dto/tag-group-param.dto';
import { AdminAuthGuard } from '@/common/guards/admin-auth-guard/admin-auth.guard';
import { ResponseService } from '@/common/modules/response/response.service';

@UseGuards(AdminAuthGuard)
@Controller('admin/tag-groups')
export class AdminTagGroupsController {
  constructor(
    private readonly tagGroupsService: AdminTagGroupsService,
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

  @Get(':id')
  async findOne(@Param() param: TagGroupParamDto) {
    const data = await this.tagGroupsService.findOne(param.id);
    return this.responseService.success({
      message: 'Tag Group retrieved successfully',
      data,
    });
  }

  @Patch(':id')
  async update(@Param() param: TagGroupParamDto, @Body() updateTagGroupDto: UpdateTagGroupDto) {
    const data = await this.tagGroupsService.update(param.id, updateTagGroupDto);
    return this.responseService.success({
      message: 'Tag Group updated successfully',
      data,
    });
  }

  @Delete(':id')
  async remove(@Param() param: TagGroupParamDto) {
    await this.tagGroupsService.remove(param.id);
    return this.responseService.success({
      message: 'Tag Group removed successfully',
      data: null,
    });
  }
}
