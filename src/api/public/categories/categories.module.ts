import { Module } from '@nestjs/common';
import { PublicCategoriesService } from './categories.service';
import { PublicCategoriesController } from './categories.controller';

@Module({
  controllers: [PublicCategoriesController],
  providers: [PublicCategoriesService],
  exports: [PublicCategoriesService],
})
export class PublicCategoriesModule {}
