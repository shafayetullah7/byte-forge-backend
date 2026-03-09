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

@ApiTags('Plants')
@Controller({ path: 'user/seller/plants', version: '1' })
@UseGuards(VerifiedUserAuthGuard)
export class SellerPlantController {
  constructor(private readonly service: SellerPlantService) {}

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new plant' })
  @ApiResponse({ status: 201, description: 'Plant created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post()
  async create(
    @AuthenticUser() auth: AccessUserAuth,
    @Body() payload: CreatePlantDto,
  ) {
    // Assuming shopId is available from auth context or needs to be fetched
    // For now, let's assume the user has a shop and we fetch/verify it.
    // Replace with actual shop retrieval logic.
    const mockShopId = 'mock-shop-uuid';
    return this.service.createPlant(mockShopId, payload);
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all plants' })
  @ApiResponse({ status: 200, description: 'Plants retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get()
  async findAll(
    @AuthenticUser() auth: AccessUserAuth,
    @Query(new ZodValidationPipe(PlantFilterDto)) filter: PlantFilterDto,
  ) {
    const mockShopId = 'mock-shop-uuid';
    return this.service.getAllPlants(mockShopId, filter);
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get a plant by ID' })
  @ApiResponse({ status: 200, description: 'Plant retrieved' })
  @ApiResponse({ status: 404, description: 'Plant not found' })
  @Get(':id')
  async findOne(
    @AuthenticUser() auth: AccessUserAuth,
    @Param('id') id: string,
  ) {
    const mockShopId = 'mock-shop-uuid';
    return this.service.getPlantById(id, mockShopId);
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
  ) {
    const mockShopId = 'mock-shop-uuid';
    return this.service.updatePlant(id, mockShopId, payload);
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a plant' })
  @ApiResponse({ status: 204, description: 'Plant deleted' })
  @ApiResponse({ status: 404, description: 'Plant not found' })
  @Delete(':id')
  async remove(@AuthenticUser() auth: AccessUserAuth, @Param('id') id: string) {
    const mockShopId = 'mock-shop-uuid';
    return this.service.deletePlant(id, mockShopId);
  }
}
