import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminAuthGuard } from '@/common/guards/admin-auth-guard/admin-auth.guard';
import { AdminTreeCategoryService } from './admin-tree-category.service';
import {
  CategoryFilterDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto/category.dto';
import { ZodValidationPipe } from 'nestjs-zod';

@Controller('admin/tree-categories')
@UseGuards(AdminAuthGuard)
export class AdminTreeCategoryController {
  constructor(private readonly service: AdminTreeCategoryService) {}

  @Post()
  create(@Body() payload: CreateCategoryDto) {
    return this.service.createCategory(payload);
  }

  @Get()
  findAll(
    @Query(new ZodValidationPipe(CategoryFilterDto)) filter: CategoryFilterDto,
  ) {
    return this.service.getAllCategories(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.getCategoryById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() payload: UpdateCategoryDto) {
    return this.service.updateCategory(id, payload);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.softDeleteCategory(id);
  }
}
