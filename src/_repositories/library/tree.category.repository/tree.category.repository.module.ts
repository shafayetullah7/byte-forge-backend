import { Module } from '@nestjs/common';
import { TreeCategoryRepository } from './tree.category.repository';

@Module({
  providers: [TreeCategoryRepository],
  exports: [TreeCategoryRepository],
})
export class TreeCategoryRepositoryModule {}
