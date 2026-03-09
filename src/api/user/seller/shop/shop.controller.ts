import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ShopService } from './shop.service';
import { SetupShopDto } from './dto/setup.shop.dto';
import { VerifiedUserAuthGuard } from '@/common/guards/verified-user-auth-guard/verified-user-auth.guard';
import { AuthenticUser } from '@/common/decorators/authentic-user.decorator';
import { TAuthenticUser } from '@/common/types';
import { ResponseService } from '@/common/modules/response/response.service';
import { SuccessResponse } from '@/common/modules/response/dto/success.response.dto';
import { TShop } from '@/_db/drizzle/schema';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Shops')
@Controller({ path: 'user/seller/shops', version: '1' })
export class ShopController {
  constructor(
    private readonly shopService: ShopService,
    private readonly responseService: ResponseService,
  ) {}

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new shop' })
  @ApiResponse({ status: 201, description: 'Shop created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post()
  @UseGuards(VerifiedUserAuthGuard)
  async createShop(
    @Body() dto: SetupShopDto,
    @AuthenticUser() authenticUser: TAuthenticUser,
  ): Promise<SuccessResponse<TShop>> {
    const shop = await this.shopService.createShop(authenticUser.user.id, dto);
    return this.responseService.success({
      message: 'Shop created successfully',
      data: shop,
    });
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all shops for current user' })
  @ApiResponse({ status: 200, description: 'Shops retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get()
  @UseGuards(VerifiedUserAuthGuard)
  async getMyShops(
    @AuthenticUser() authenticUser: TAuthenticUser,
  ): Promise<SuccessResponse<TShop[]>> {
    const shops = await this.shopService.getShopsByUser(authenticUser.user.id);
    return this.responseService.success({
      message: 'Shops retrieved successfully',
      data: shops,
    });
  }
}
