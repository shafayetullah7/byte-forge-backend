import { Injectable } from '@nestjs/common';
import { ListPlantsService, PublicPlantListItem } from './services/list-plants.service';
import { GetPlantBySlugService, PublicPlantDetail } from './services/get-plant-by-slug.service';
import { ListPlantsQueryDto } from './dto/list-plants-query.dto';
import { PaginatedResult } from '@/common/types/pagination.type';

@Injectable()
export class PublicPlantsService {
  constructor(
    private readonly listPlantsService: ListPlantsService,
    private readonly getPlantBySlugService: GetPlantBySlugService,
  ) {}

  listPlants(
    query: ListPlantsQueryDto,
    lang: string,
  ): Promise<PaginatedResult<PublicPlantListItem>> {
    return this.listPlantsService.execute(query, lang);
  }

  getPlantBySlug(slug: string, lang: string): Promise<PublicPlantDetail> {
    return this.getPlantBySlugService.execute(slug, lang);
  }
}
