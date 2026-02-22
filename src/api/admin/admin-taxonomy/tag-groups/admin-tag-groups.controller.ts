import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { AdminTagGroupsService } from './admin-tag-groups.service';
import { CreateTagGroupDto } from './dto/create-tag-group.dto';
import { UpdateTagGroupDto } from './dto/update-tag-group.dto';
import { AdminAuthGuard } from '@/common/guards/admin-auth-guard/admin-auth.guard';

@UseGuards(AdminAuthGuard)
@Controller('admin/tag-groups')
export class AdminTagGroupsController {
  constructor(private readonly tagGroupsService: AdminTagGroupsService) {}

  @Post()
  create(@Body() createTagGroupDto: CreateTagGroupDto) {
    return this.tagGroupsService.create(createTagGroupDto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.tagGroupsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tagGroupsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTagGroupDto: UpdateTagGroupDto) {
    return this.tagGroupsService.update(id, updateTagGroupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tagGroupsService.remove(id);
  }
}
