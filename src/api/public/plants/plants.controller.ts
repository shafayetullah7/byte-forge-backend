import { Controller, Get, Param, Query } from '@nestjs/common';
import { PublicPlantsService } from './plants.service';
import { ResponseService } from '@/common/modules/response/response.service';
import { ListPlantsQueryDto } from './dto/list-plants-query.dto';
import { PlantSlugParamsDto } from './dto/plant-slug.params.dto';
import { I18nLang, I18nService } from 'nestjs-i18n';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ApiNotFoundResponse } from '@/common/decorators/api-error.decorator';
import {
  CareDifficultyEnum,
  LightRequirementEnum,
  WateringFrequencyEnum,
  HumidityLevelEnum,
  GrowthRateEnum,
} from '@/_db/drizzle/enum';

@ApiTags('🌿 Public - Plants')
@Controller({ path: 'plants', version: '1' })
export class PublicPlantsController {
  constructor(
    private readonly publicPlantsService: PublicPlantsService,
    private readonly responseService: ResponseService,
    private readonly i18n: I18nService,
  ) {}

  @ApiOperation({
    summary: 'List all active plants',
    description:
      'Returns a paginated list of all active plants with optional filters. Only returns plants with status ACTIVE from shops with status ACTIVE.',
  })
  @ApiResponse({ status: 200, description: 'Plants retrieved successfully' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 12, max: 100)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by name, scientific name, common names',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    type: String,
    format: 'uuid',
    description: 'Filter by category',
  })
  @ApiQuery({
    name: 'tagIds',
    required: false,
    type: String,
    description: 'Comma-separated tag UUIDs',
  })
  @ApiQuery({
    name: 'careDifficulty',
    required: false,
    enum: CareDifficultyEnum,
    description: 'Filter by care level',
  })
  @ApiQuery({
    name: 'lightRequirement',
    required: false,
    enum: LightRequirementEnum,
    description: 'Filter by light requirement',
  })
  @ApiQuery({
    name: 'wateringFrequency',
    required: false,
    enum: WateringFrequencyEnum,
    description: 'Filter by watering frequency',
  })
  @ApiQuery({
    name: 'humidityLevel',
    required: false,
    enum: HumidityLevelEnum,
    description: 'Filter by humidity level',
  })
  @ApiQuery({
    name: 'growthRate',
    required: false,
    enum: GrowthRateEnum,
    description: 'Filter by growth rate',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    type: Number,
    description: 'Minimum price',
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    type: Number,
    description: 'Maximum price',
  })
  @ApiQuery({
    name: 'inStockOnly',
    required: false,
    type: Boolean,
    description: 'Only show in-stock plants',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['name', 'price', 'difficulty', 'inventory', 'createdAt'],
    default: 'createdAt',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @Get()
  async listPlants(
    @Query() query: ListPlantsQueryDto,
    @I18nLang() lang: string,
  ) {
    console.log(query);
    const result = await this.publicPlantsService.listPlants(query, lang);
    console.log(result);
    return this.responseService.paginated({
      message: this.i18n.t('message.success.plantsRetrieved', { lang }),
      data: result.data,
      meta: result.meta,
    });
  }

  @ApiOperation({
    summary: 'Get plant by slug',
    description:
      'Returns full plant details including variants, care instructions, media, shop info, and SEO metadata. Only returns ACTIVE plants from ACTIVE shops.',
  })
  @ApiResponse({
    status: 200,
    description: 'Plant details retrieved successfully',
  })
  @ApiNotFoundResponse('Plant not found')
  @Get(':slug')
  async getPlantBySlug(
    @Param() params: PlantSlugParamsDto,
    @I18nLang() lang: string,
  ) {
    const plant = await this.publicPlantsService.getPlantBySlug(
      params.slug,
      lang,
    );
    console.log(plant);
    return this.responseService.success({
      message: this.i18n.t('message.success.plantRetrieved', { lang }),
      data: plant,
    });
  }
}
