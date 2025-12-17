import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ShopService } from './shop.service';
import { SetupShopDto } from './dto/setup.shop.dto';
import { UserAuthGuard } from '@/common/guards/user-auth.guard';
import { AuthenticUser } from '@/common/decorators/authentic-user.decorator';
import { TAuthenticUser } from '@/common/types';

@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Post()
  @UseGuards(UserAuthGuard)
  async createShop(
    @Body() dto: SetupShopDto,
    @AuthenticUser() authenticUser: TAuthenticUser,
  ) {
    return this.shopService.createShop(authenticUser.user.id, dto);
  }

  @Get()
  @UseGuards(UserAuthGuard)
  async getMyShops(@AuthenticUser() authenticUser: TAuthenticUser) {
    return this.shopService.getShopsByUser(authenticUser.user.id);
  }
}
