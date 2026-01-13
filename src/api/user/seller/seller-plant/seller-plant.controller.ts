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
import { UserAuthGuard } from '@/common/guards/user-auth-guard/user-auth.guard';
import { SellerPlantService } from './seller-plant.service';
import {
  CreatePlantDto,
  UpdatePlantDto,
  PlantFilterDto,
} from './dto/plant.dto';
import { AuthenticUser } from '@/common/decorators/authentic-user.decorator';
import { AccessUserAuth } from '@/common/types';
import { ZodValidationPipe } from 'nestjs-zod';

@Controller({ path: 'user/seller/plants', version: '1' })
@UseGuards(UserAuthGuard)
export class SellerPlantController {
  constructor(private readonly service: SellerPlantService) {}

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

  @Get()
  async findAll(
    @AuthenticUser() auth: AccessUserAuth,
    @Query(new ZodValidationPipe(PlantFilterDto)) filter: PlantFilterDto,
  ) {
    const mockShopId = 'mock-shop-uuid';
    return this.service.getAllPlants(mockShopId, filter);
  }

  @Get(':id')
  async findOne(
    @AuthenticUser() auth: AccessUserAuth,
    @Param('id') id: string,
  ) {
    const mockShopId = 'mock-shop-uuid';
    return this.service.getPlantById(id, mockShopId);
  }

  @Patch(':id')
  async update(
    @AuthenticUser() auth: AccessUserAuth,
    @Param('id') id: string,
    @Body() payload: UpdatePlantDto,
  ) {
    const mockShopId = 'mock-shop-uuid';
    return this.service.updatePlant(id, mockShopId, payload);
  }

  @Delete(':id')
  async remove(@AuthenticUser() auth: AccessUserAuth, @Param('id') id: string) {
    const mockShopId = 'mock-shop-uuid';
    return this.service.deletePlant(id, mockShopId);
  }
}
