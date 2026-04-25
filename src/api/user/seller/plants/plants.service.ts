import { Injectable } from '@nestjs/common';
import { CreatePlantDto } from './dto/create-plant.dto';
import { ListPlantsQueryDto } from './dto/list-plants-query.dto';
import { CreatePlantService } from './services/create-plant.service';
import { ListPlantsService } from './services/list-plants.service';

@Injectable()
export class PlantsService {
  constructor(
    private readonly createPlantService: CreatePlantService,
    private readonly listPlantsService: ListPlantsService,
  ) {}

  async createPlant(userId: string, dto: CreatePlantDto, lang: string) {
    return this.createPlantService.execute(userId, dto, lang);
  }

  async getPlants(shopId: string, query: ListPlantsQueryDto) {
    return this.listPlantsService.execute(shopId, query);
  }
}
