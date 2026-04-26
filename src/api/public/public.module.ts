import { Module } from '@nestjs/common';
import { PublicCategoriesModule } from './categories/categories.module';
import { PublicTagsModule } from './tags/tags.module';

@Module({
  imports: [PublicCategoriesModule, PublicTagsModule],
  exports: [PublicCategoriesModule, PublicTagsModule],
})
export class PublicApiModule {}
