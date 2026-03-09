import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ApplySellerDto } from './dto/apply.seller.dto';
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
import { I18nLang, I18nService } from 'nestjs-i18n';

@ApiTags('Shops')
@Controller({ path: 'user/seller/shops', version: '1' })
export class ShopController {
  constructor(
    private readonly shopService: ShopService,
    private readonly responseService: ResponseService,
    private readonly i18n: I18nService,
  ) {}

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Apply for a new shop' })
  @ApiResponse({
    status: 201,
    description: 'Application submitted successfully',
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post('apply')
  @UseGuards(VerifiedUserAuthGuard)
  async applyAsSeller(
    @Body() dto: ApplySellerDto,
    @AuthenticUser() authenticUser: TAuthenticUser,
    @I18nLang() lang: string,
  ): Promise<SuccessResponse<TShop>> {
    const shop = await this.shopService.applyAsSeller(
      authenticUser.user.id,
      dto,
      lang,
    );
    return this.responseService.success({
      message: this.i18n.t('message.success.shopCreated', { lang }),
      data: shop,
    });
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user shop' })
  @ApiResponse({ status: 200, description: 'Shop retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('my-shop')
  @UseGuards(VerifiedUserAuthGuard)
  async getMyShop(
    @AuthenticUser() authenticUser: TAuthenticUser,
    @I18nLang() lang: string,
  ): Promise<SuccessResponse<TShop | null>> {
    const shop = await this.shopService.getShopByUser(authenticUser.user.id);
    return this.responseService.success({
      message: this.i18n.t('message.success.userRetrieved', { lang }),
      data: shop,
    });
  }
}
