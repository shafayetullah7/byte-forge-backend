import { Module } from '@nestjs/common';
import { AdminCategoriesService } from './admin-categories.service';
import { AdminCategoryTranslationsService } from './services/admin-category-translations.service';
import { AdminCategoriesController } from './admin-categories.controller';
import { CategoryRepositoryModule } from '@/_repositories/library/taxonomy/category.repository.module';

@Module({
  imports: [CategoryRepositoryModule],
  controllers: [AdminCategoriesController],
  providers: [AdminCategoriesService, AdminCategoryTranslationsService],
  exports: [AdminCategoriesService, AdminCategoryTranslationsService],
})
export class AdminCategoriesModule {}
