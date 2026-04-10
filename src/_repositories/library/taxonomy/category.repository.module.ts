import { Module } from '@nestjs/common';
import { CategoryRepository } from './category.repository';
import { CategoryHierarchyRepository } from './category-hierarchy.repository';

@Module({
  imports: [],
  providers: [CategoryRepository, CategoryHierarchyRepository],
  exports: [CategoryRepository, CategoryHierarchyRepository],
})
export class CategoryRepositoryModule {}
