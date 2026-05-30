import { Module } from '@nestjs/common';
import { PublicCategoriesModule } from './categories/categories.module';
import { PublicTagsModule } from './tags/tags.module';
import { PublicPlantsModule } from './plants/plants.module';
import { PublicLocationModule } from './location/location.module';
import { PublicShopsModule } from './shops/shops.module';

@Module({
  imports: [PublicCategoriesModule, PublicTagsModule, PublicPlantsModule, PublicLocationModule, PublicShopsModule],
  exports: [PublicCategoriesModule, PublicTagsModule, PublicPlantsModule, PublicLocationModule, PublicShopsModule],
})
export class PublicApiModule {}
