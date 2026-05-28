import { Module } from '@nestjs/common';
import { PublicCategoriesModule } from './categories/categories.module';
import { PublicTagsModule } from './tags/tags.module';
import { PublicPlantsModule } from './plants/plants.module';

@Module({
  imports: [PublicCategoriesModule, PublicTagsModule, PublicPlantsModule],
  exports: [PublicCategoriesModule, PublicTagsModule, PublicPlantsModule],
})
export class PublicApiModule {}
