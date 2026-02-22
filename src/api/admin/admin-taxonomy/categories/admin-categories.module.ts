import { Module } from '@nestjs/common';
import { AdminCategoriesService } from './admin-categories.service';
import { AdminCategoriesController } from './admin-categories.controller';
import { CategoryRepositoryModule } from '@/_repositories/library/taxonomy/category.repository.module';

@Module({
  imports: [CategoryRepositoryModule],
  controllers: [AdminCategoriesController],
  providers: [AdminCategoriesService],
  exports: [AdminCategoriesService],
})
export class AdminCategoriesModule {}
