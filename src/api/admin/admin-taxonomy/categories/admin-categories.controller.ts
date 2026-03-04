import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { AdminCategoriesService } from './admin-categories.service';
import { AdminCategoryTranslationsService } from './services/admin-category-translations.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryQueryDto } from './dto/category-query.dto';
import { CategoryParamDto } from './dto/category-param.dto';
import { UpsertCategoryTranslationDto } from './dto/upsert-category-translation.dto';
import { CategoryTranslationParamDto } from './dto/category-translation-param.dto';
import { AdminAuthGuard } from '@/common/guards/admin-auth-guard/admin-auth.guard';
import { ResponseService } from '@/common/modules/response/response.service';

@UseGuards(AdminAuthGuard)
@Controller('admin/categories')
export class AdminCategoriesController {
  constructor(
    private readonly categoriesService: AdminCategoriesService,
    private readonly categoryTranslationsService: AdminCategoryTranslationsService,
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

  @Get(':id/ancestors')
  async getAncestors(@Param() param: CategoryParamDto) {
    const data = await this.categoriesService.getAncestors(param.id);
    return this.responseService.success({
      message: 'Category ancestors retrieved successfully',
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

  // --- CATEGORY TRANSLATION SUB-RESOURCES ---

  @Get(':category_id/translations')
  async findAllTranslations(@Param('category_id') categoryId: string) {
    const data = await this.categoryTranslationsService.findAllByCategory(categoryId);
    return this.responseService.success({
      message: 'Category translations retrieved successfully',
      data,
    });
  }

  @Post(':category_id/translations')
  async upsertTranslation(
    @Param('category_id') categoryId: string,
    @Body() upsertDto: UpsertCategoryTranslationDto,
  ) {
    const data = await this.categoryTranslationsService.upsert(categoryId, upsertDto);
    return this.responseService.success({
      message: 'Category translation saved successfully',
      data,
    });
  }

  @Delete(':category_id/translations/:locale')
  async removeTranslation(@Param() param: CategoryTranslationParamDto) {
    await this.categoryTranslationsService.remove(param.category_id, param.locale);
    return this.responseService.success({
      message: 'Category translation deleted successfully',
      data: null,
    });
  }
}
