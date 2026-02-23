import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { AdminCategoriesService } from './admin-categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryQueryDto } from './dto/category-query.dto';
import { CategoryParamDto } from './dto/category-param.dto';
import { AdminAuthGuard } from '@/common/guards/admin-auth-guard/admin-auth.guard';
import { ResponseService } from '@/common/modules/response/response.service';

@UseGuards(AdminAuthGuard)
@Controller('admin/categories')
export class AdminCategoriesController {
  constructor(
    private readonly categoriesService: AdminCategoriesService,
    private readonly responseService: ResponseService,
  ) {}

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const data = await this.categoriesService.create(createCategoryDto);
    return this.responseService.success({
      message: 'Category created successfully',
      data,
    });
  }

  @Get()
  async findAll(@Query() query: CategoryQueryDto) {
    const list = await this.categoriesService.findAll(query);
    return this.responseService.paginated({
      message: 'Categories retrieved successfully',
      data: list.data,
      meta: list.meta,
    });
  }

  @Get('tree')
  async getTree() {
    const data = await this.categoriesService.getTree();
    return this.responseService.success({
      message: 'Category tree retrieved successfully',
      data,
    });
  }

  @Get(':id')
  async findOne(@Param() param: CategoryParamDto) {
    const data = await this.categoriesService.findOne(param.id);
    return this.responseService.success({
      message: 'Category retrieved successfully',
      data,
    });
  }

  @Patch(':id')
  async update(@Param() param: CategoryParamDto, @Body() updateCategoryDto: UpdateCategoryDto) {
    const data = await this.categoriesService.update(param.id, updateCategoryDto);
    return this.responseService.success({
      message: 'Category updated successfully',
      data,
    });
  }

  @Delete(':id')
  async remove(@Param() param: CategoryParamDto) {
    await this.categoriesService.remove(param.id);
    return this.responseService.success({
      message: 'Category removed successfully',
      data: null,
    });
  }
}
