import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ShopService } from './shop.service';
import { SetupShopDto } from './dto/setup.shop.dto';
import { UserAuthGuard } from '@/common/guards/user-auth.guard';
import { AuthenticUser } from '@/common/decorators/authentic-user.decorator';
import { TAuthenticUser } from '@/common/types';
import { ResponseService } from '@/common/modules/response/response.service';
import { SuccessResponse } from '@/common/modules/response/dto/success.response.dto';
import { TShop } from '@/_db/drizzle/schema';

@Controller('user/seller/shops')
export class ShopController {
  constructor(
    private readonly shopService: ShopService,
    private readonly responseService: ResponseService,
  ) {}

  @Post()
  @UseGuards(UserAuthGuard)
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

  @Get()
  @UseGuards(UserAuthGuard)
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
