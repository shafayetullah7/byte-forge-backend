import { Module } from '@nestjs/common';
import { PublicPlantsController } from './plants.controller';
import { PublicPlantsService } from './plants.service';
import { ListPlantsService } from './services/list-plants.service';
import { GetPlantBySlugService } from './services/get-plant-by-slug.service';

@Module({
  controllers: [PublicPlantsController],
  providers: [PublicPlantsService, ListPlantsService, GetPlantBySlugService],
  exports: [PublicPlantsService],
})
export class PublicPlantsModule {}
