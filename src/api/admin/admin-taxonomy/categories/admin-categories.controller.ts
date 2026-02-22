import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { AdminCategoriesService } from './admin-categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AdminAuthGuard } from '@/common/guards/admin-auth-guard/admin-auth.guard';

@UseGuards(AdminAuthGuard)
@Controller('admin/categories')
export class AdminCategoriesController {
  constructor(private readonly categoriesService: AdminCategoriesService) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.categoriesService.findAll(query);
  }

  @Get('tree')
  getTree() {
    return this.categoriesService.getTree();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
