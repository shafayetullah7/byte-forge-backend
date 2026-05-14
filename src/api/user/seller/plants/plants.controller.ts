import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PlantsService } from './plants.service';
import { CreatePlantDto } from './dto/create-plant.dto';
import { ListPlantsQueryDto } from './dto/list-plants-query.dto';
import { GetPlantByIdParamsDto } from './dto/get-plant-by-id-params.dto';
import { VerifiedUserAuthGuard } from '@/common/guards/verified-user-auth-guard/verified-user-auth.guard';
import { AuthenticUser } from '@/common/decorators/authentic-user.decorator';
import { TAuthenticUser } from '@/common/types';
import { ResponseService } from '@/common/modules/response/response.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { I18nLang, I18nService } from 'nestjs-i18n';
import { ApiAuth, ApiPaginatedResponse } from '@/common/decorators/swagger.decorators';
import {
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
} from '@/common/decorators/api-error.decorator';
import { ZodValidationPipe } from 'nestjs-zod';
import {
  PlantListItemResponseDto,
  PlantCreateResponseDto,
  PlantDetailResponseDto,
} from './dto/plants-response.dto';
import { ProductStatusEnum } from '@/_db/drizzle/enum';

@ApiTags('🌱 Seller - Plants Management')
@Controller({ path: 'user/seller/plants', version: '1' })
export class PlantsController {
  constructor(
    private readonly plantsService: PlantsService,
    private readonly responseService: ResponseService,
    private readonly i18n: I18nService,
  ) {}

  @ApiAuth()
  @ApiOperation({
    summary: 'List plants',
    description:
      'Returns a paginated list of plants for the authenticated seller',
  })
  @ApiPaginatedResponse(PlantListItemResponseDto)
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by name or slug',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ProductStatusEnum,
    description: 'Filter by product status',
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
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'updatedAt', 'name', 'price', 'inventory'],
    default: 'createdAt',
    description: 'Sort field',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    default: 'desc',
    description: 'Sort direction',
  })
  @ApiUnauthorizedResponse()
  @Get()
  @UseGuards(VerifiedUserAuthGuard)
  async getPlants(
    @Query(new ZodValidationPipe(ListPlantsQueryDto.schema)) query: ListPlantsQueryDto,
    @AuthenticUser() authenticUser: TAuthenticUser,
    @I18nLang() lang: string,
  ) {
    const result = await this.plantsService.getPlants(authenticUser.user.id, query, lang);
    return this.responseService.paginated({
      message: this.i18n.t('message.success.plantsRetrieved', { lang }),
      data: result.data,
      meta: result.meta,
    });
  }

  @ApiAuth()
  @ApiOperation({
    summary: 'Get plant by ID',
    description: 'Returns full plant details including variants, care instructions, and all translations',
  })
  @ApiResponse({
    status: 200,
    description: 'Plant details retrieved successfully',
    type: PlantDetailResponseDto,
  })
  @ApiBadRequestResponse('Validation failed')
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse('Plant not found')
  @Get(':id')
  @UseGuards(VerifiedUserAuthGuard)
  async getPlantById(
    @Param() params: GetPlantByIdParamsDto,
    @AuthenticUser() authenticUser: TAuthenticUser,
    @I18nLang() lang: string,
  ) {
    const plant = await this.plantsService.getPlantById(authenticUser.user.id, params.id, lang);
    return this.responseService.success({
      message: this.i18n.t('message.success.plantRetrieved', { lang }),
      data: plant,
    });
  }

  @ApiAuth()
  @ApiOperation({
    summary: 'Create plant',
    description: 'Creates a new plant product with variants, care instructions, and media',
  })
  @ApiResponse({
    status: 201,
    description: 'Plant created successfully',
    type: PlantCreateResponseDto,
  })
  @ApiBadRequestResponse('Validation failed')
  @ApiUnauthorizedResponse()
  @ApiConflictResponse('Slug already exists')
  @Post()
  @UseGuards(VerifiedUserAuthGuard)
  async createPlant(
    @Body(new ZodValidationPipe(CreatePlantDto.schema)) dto: CreatePlantDto,
    @AuthenticUser() authenticUser: TAuthenticUser,
    @I18nLang() lang: string,
  ) {
    const plant = await this.plantsService.createPlant(
      authenticUser.user.id,
      dto,
      lang,
    );
    return this.responseService.success({
      message: this.i18n.t('message.success.plantCreated', { lang }),
      data: plant,
    });
  }
}
