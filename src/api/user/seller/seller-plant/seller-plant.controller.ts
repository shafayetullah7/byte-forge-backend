import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { VerifiedUserAuthGuard } from '@/common/guards/verified-user-auth-guard/verified-user-auth.guard';
import { SellerPlantService } from './seller-plant.service';
import { ResponseService } from '@/common/modules/response/response.service';
import {
  CreatePlantDto,
  UpdatePlantDto,
  PlantFilterDto,
} from './dto/plant.dto';
import { AuthenticUser } from '@/common/decorators/authentic-user.decorator';
import { AccessUserAuth } from '@/common/types';
import { ZodValidationPipe } from 'nestjs-zod';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { I18nLang, I18nService } from 'nestjs-i18n';

@ApiTags('Plants')
@Controller({ path: 'user/seller/plants', version: '1' })
@UseGuards(VerifiedUserAuthGuard)
export class SellerPlantController {
  constructor(
    private readonly service: SellerPlantService,
    private readonly responseService: ResponseService,
    private readonly i18n: I18nService,
  ) {}

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new plant' })
  @ApiResponse({ status: 201, description: 'Plant created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post()
  async create(
    @AuthenticUser() auth: AccessUserAuth,
    @Body() payload: CreatePlantDto,
    @I18nLang() lang: string,
  ) {
    // Assuming shopId is available from auth context or needs to be fetched
    // For now, let's assume the user has a shop and we fetch/verify it.
    // Replace with actual shop retrieval logic.
    const mockShopId = 'mock-shop-uuid';
    const plant = await this.service.createPlant(mockShopId, payload);
    return this.responseService.success({
      message: this.i18n.t('message.success.plantCreated', { lang }),
      data: plant,
    });
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all plants' })
  @ApiResponse({ status: 200, description: 'Plants retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get()
  async findAll(
    @AuthenticUser() auth: AccessUserAuth,
    @Query(new ZodValidationPipe(PlantFilterDto)) filter: PlantFilterDto,
    @I18nLang() lang: string,
  ) {
    const mockShopId = 'mock-shop-uuid';
    const list = await this.service.getAllPlants(mockShopId, filter);
    return this.responseService.paginated({
      message: this.i18n.t('message.success.plantRetrieved', { lang }),
      data: list.data,
      meta: list.meta,
    });
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get a plant by ID' })
  @ApiResponse({ status: 200, description: 'Plant retrieved' })
  @ApiResponse({ status: 404, description: 'Plant not found' })
  @Get(':id')
  async findOne(
    @AuthenticUser() auth: AccessUserAuth,
    @Param('id') id: string,
    @I18nLang() lang: string,
  ) {
    const mockShopId = 'mock-shop-uuid';
    const plant = await this.service.getPlantById(id, mockShopId);
    return this.responseService.success({
      message: this.i18n.t('message.success.plantRetrieved', { lang }),
      data: plant,
    });
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a plant' })
  @ApiResponse({ status: 200, description: 'Plant updated' })
  @ApiResponse({ status: 404, description: 'Plant not found' })
  @Patch(':id')
  async update(
    @AuthenticUser() auth: AccessUserAuth,
    @Param('id') id: string,
    @Body() payload: UpdatePlantDto,
    @I18nLang() lang: string,
  ) {
    const mockShopId = 'mock-shop-uuid';
    const result = await this.service.updatePlant(id, mockShopId, payload);
    return this.responseService.success({
      message: this.i18n.t('message.success.plantUpdated', { lang }),
      data: result,
    });
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a plant' })
  @ApiResponse({ status: 204, description: 'Plant deleted' })
  @ApiResponse({ status: 404, description: 'Plant not found' })
  @Delete(':id')
  async remove(
    @AuthenticUser() auth: AccessUserAuth,
    @Param('id') id: string,
    @I18nLang() lang: string,
  ) {
    const mockShopId = 'mock-shop-uuid';
    await this.service.deletePlant(id, mockShopId);
    return this.responseService.success({
      message: this.i18n.t('message.success.plantDeleted', { lang }),
      data: null,
    });
  }
}
