import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { AdminTagsService } from './admin-tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagQueryDto } from './dto/tag-query.dto';
import { TagParamDto } from './dto/tag-param.dto';
import { AdminAuthGuard } from '@/common/guards/admin-auth-guard/admin-auth.guard';
import { ResponseService } from '@/common/modules/response/response.service';

@UseGuards(AdminAuthGuard)
@Controller('admin/tags')
export class AdminTagsController {
  constructor(
    private readonly tagsService: AdminTagsService,
    private readonly responseService: ResponseService,
  ) {}

  @Post()
  async create(@Body() createTagDto: CreateTagDto) {
    const data = await this.tagsService.create(createTagDto);
    return this.responseService.success({
      message: 'Tag created successfully',
      data,
    });
  }

  @Get()
  async findAll(@Query() query: TagQueryDto) {
    const list = await this.tagsService.findAll(query);
    return this.responseService.paginated({
      message: 'Tags retrieved successfully',
      data: list.data,
      meta: list.meta,
    });
  }

  @Get(':id')
  async findOne(@Param() param: TagParamDto) {
    const data = await this.tagsService.findOne(param.id);
    return this.responseService.success({
      message: 'Tag retrieved successfully',
      data,
    });
  }

  @Patch(':id')
  async update(@Param() param: TagParamDto, @Body() updateTagDto: UpdateTagDto) {
    const data = await this.tagsService.update(param.id, updateTagDto);
    return this.responseService.success({
      message: 'Tag updated successfully',
      data,
    });
  }

  @Delete(':id')
  async remove(@Param() param: TagParamDto) {
    await this.tagsService.remove(param.id);
    return this.responseService.success({
      message: 'Tag removed successfully',
      data: null,
    });
  }
}
