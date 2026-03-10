import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { AdminShopService } from './admin-shop.service';
import { VerifyShopDto } from './dto/verify-shop.dto';
import { ShopQueryDto } from './dto/shop-query.dto';
import { SuspendShopDto } from './dto/suspend-shop.dto';
import { DeactivateShopDto } from './dto/deactivate-shop.dto';
import { AdminAuthGuard } from '@/common/guards/admin-auth-guard/admin-auth.guard';
import { ResponseService } from '@/common/modules/response/response.service';
import { PaginationParams } from '@/common/schemas/pagination.schema';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Admin Shops')
@Controller({ path: 'admin/shops', version: '1' })
export class AdminShopController {
  constructor(
    private readonly adminShopService: AdminShopService,
    private readonly responseService: ResponseService,
  ) {}

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all pending shop verifications' })
  @ApiResponse({ status: 200, description: 'Pending verifications retrieved' })
  @Get('pending-verifications')
  @UseGuards(AdminAuthGuard)
  async getPendingVerifications(@Query() query: PaginationParams) {
    const verifications = await this.adminShopService.getPendingVerifications(
      query,
    );
    return this.responseService.paginated({
      message: 'Pending verifications retrieved successfully',
      data: verifications.data,
      meta: verifications.meta,
    });
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Verify/Approve a shop' })
  @ApiResponse({ status: 200, description: 'Shop verification updated' })
  @Post(':id/verify')
  @UseGuards(AdminAuthGuard)
  async verifyShop(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: VerifyShopDto,
  ) {
    const verification = await this.adminShopService.verifyShop(id, dto);
    return this.responseService.success({
      message: 'Shop verification updated successfully',
      data: verification,
    });
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all shops with filtering' })
  @ApiResponse({ status: 200, description: 'Shops retrieved' })
  @Get()
  @UseGuards(AdminAuthGuard)
  async getAllShops(@Query() query: ShopQueryDto) {
    const result = await this.adminShopService.getAllShops(query);
    return this.responseService.paginated({
      message: 'Shops retrieved successfully',
      data: result.data,
      meta: result.meta,
    });
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get shop statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  @Get('stats')
  @UseGuards(AdminAuthGuard)
  async getShopStats() {
    const stats = await this.adminShopService.getShopStats();
    return this.responseService.success({
      message: 'Statistics retrieved successfully',
      data: stats,
    });
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get a shop by ID' })
  @ApiResponse({ status: 200, description: 'Shop retrieved' })
  @Get(':id')
  @UseGuards(AdminAuthGuard)
  async getShopById(@Param('id', ParseUUIDPipe) id: string) {
    const shop = await this.adminShopService.getShopById(id);
    return this.responseService.success({
      message: 'Shop retrieved successfully',
      data: shop,
    });
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Suspend an active shop' })
  @ApiResponse({ status: 200, description: 'Shop suspended' })
  @Post(':id/suspend')
  @UseGuards(AdminAuthGuard)
  async suspendShop(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SuspendShopDto,
  ) {
    const result = await this.adminShopService.suspendShop(id, dto);
    return this.responseService.success({
      message: 'Shop suspended successfully',
      data: result,
    });
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Deactivate a shop permanently' })
  @ApiResponse({ status: 200, description: 'Shop deactivated' })
  @Post(':id/deactivate')
  @UseGuards(AdminAuthGuard)
  async deactivateShop(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DeactivateShopDto,
  ) {
    const result = await this.adminShopService.deactivateShop(id, dto);
    return this.responseService.success({
      message: 'Shop deactivated successfully',
      data: result,
    });
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Reactivate a suspended or deactivated shop' })
  @ApiResponse({ status: 200, description: 'Shop reactivated' })
  @Post(':id/reactivate')
  @UseGuards(AdminAuthGuard)
  async reactivateShop(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.adminShopService.reactivateShop(id);
    return this.responseService.success({
      message: 'Shop reactivated successfully',
      data: result,
    });
  }
}
