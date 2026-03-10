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
import { AuthenticShop } from '@/common/decorators/authentic-shop.decorator';
import { AccessUserAuth, TAuthorizedShop } from '@/common/types';
import { SellerShopGuard } from '@/common/guards/seller-shop-guard/seller-shop.guard';
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
@UseGuards(VerifiedUserAuthGuard, SellerShopGuard)
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
    @AuthenticShop() shop: TAuthorizedShop,
    @Body() payload: CreatePlantDto,
    @I18nLang() lang: string,
  ) {
    const plant = await this.service.createPlant(shop.id, payload, lang);
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
    @AuthenticShop() shop: TAuthorizedShop,
    @Query(new ZodValidationPipe(PlantFilterDto)) filter: PlantFilterDto,
    @I18nLang() lang: string,
  ) {
    const list = await this.service.getAllPlants(shop.id, lang, filter);
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
    @AuthenticShop() shop: TAuthorizedShop,
    @Param('id') id: string,
    @I18nLang() lang: string,
  ) {
    const plant = await this.service.getPlantById(id, shop.id, lang);
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
    @AuthenticShop() shop: TAuthorizedShop,
    @Param('id') id: string,
    @Body() payload: UpdatePlantDto,
    @I18nLang() lang: string,
  ) {
    const result = await this.service.updatePlant(id, shop.id, payload, lang);
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
    @AuthenticShop() shop: TAuthorizedShop,
    @Param('id') id: string,
    @I18nLang() lang: string,
  ) {
    await this.service.deletePlant(id, shop.id);
    return this.responseService.success({
      message: this.i18n.t('message.success.plantDeleted', { lang }),
      data: null,
    });
  }
}
