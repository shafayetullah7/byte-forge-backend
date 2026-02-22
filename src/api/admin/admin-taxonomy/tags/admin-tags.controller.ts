import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { AdminTagsService } from './admin-tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { AdminAuthGuard } from '@/common/guards/admin-auth-guard/admin-auth.guard';

@UseGuards(AdminAuthGuard)
@Controller('admin/tags')
export class AdminTagsController {
  constructor(private readonly tagsService: AdminTagsService) {}

  @Post()
  create(@Body() createTagDto: CreateTagDto) {
    return this.tagsService.create(createTagDto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.tagsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tagsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    return this.tagsService.update(id, updateTagDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tagsService.remove(id);
  }
}
