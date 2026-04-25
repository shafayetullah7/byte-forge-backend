import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PlantsService } from './plants.service';
import { CreatePlantDto } from './dto/create-plant.dto';
import { ListPlantsQueryDto } from './dto/list-plants-query.dto';
import { VerifiedUserAuthGuard } from '@/common/guards/verified-user-auth-guard/verified-user-auth.guard';
import { AuthenticUser } from '@/common/decorators/authentic-user.decorator';
import { TAuthenticUser } from '@/common/types';
import { ResponseService } from '@/common/modules/response/response.service';
import { SuccessResponse } from '@/common/modules/response/dto/success.response.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { I18nLang, I18nService } from 'nestjs-i18n';
import { ApiAuth } from '@/common/decorators/swagger.decorators';
import {
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
} from '@/common/decorators/api-error.decorator';
import { ApiPagination } from '@/common/decorators/api-pagination.decorator';
import { ZodValidationPipe } from 'nestjs-zod';

@ApiTags('🌱 Seller - Plants Management')
@Controller({ path: 'user/seller/plants', version: '1' })
export class PlantsController {
  constructor(
    private readonly plantsService: PlantsService,
    private readonly responseService: ResponseService,
    private readonly i18n: I18nService,
  ) {}

  @ApiAuth()
  @ApiOperation({ summary: 'Get all plants for seller', description: 'Returns a paginated list of plants owned by the authenticated seller' })
  @ApiResponse({ status: 200, description: 'Plants retrieved successfully' })
  @ApiPagination()
  @ApiUnauthorizedResponse()
  @Get()
  @UseGuards(VerifiedUserAuthGuard)
  async getPlants(
    @Query(new ZodValidationPipe(ListPlantsQueryDto.schema)) query: ListPlantsQueryDto,
    @AuthenticUser() authenticUser: TAuthenticUser,
    @I18nLang() lang: string,
  ) {
    const result = await this.plantsService.getPlants(authenticUser.user.id, query);
    return this.responseService.paginated({
      message: this.i18n.t('message.success.plantsRetrieved', { lang }),
      data: result.data,
      meta: result.meta,
    });
  }

  @ApiAuth()
  @ApiOperation({
    summary: 'Create new plant',
    description: 'Creates a new plant product with variants, care instructions, and media',
  })
  @ApiResponse({ status: 201, description: 'Plant created successfully' })
  @ApiBadRequestResponse('Validation failed')
  @ApiUnauthorizedResponse()
  @ApiConflictResponse('Slug already exists')
  @Post()
  @UseGuards(VerifiedUserAuthGuard)
  async createPlant(
    @Body(new ZodValidationPipe(CreatePlantDto.schema)) dto: CreatePlantDto,
    @AuthenticUser() authenticUser: TAuthenticUser,
    @I18nLang() lang: string,
  ): Promise<SuccessResponse<any>> {
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
