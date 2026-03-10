import { Body, Controller, Get, Param, Patch, Post, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ApplySellerDto } from './dto/apply.seller.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { UpdateBrandingDto } from './dto/update-branding.dto';
import { VerifiedUserAuthGuard } from '@/common/guards/verified-user-auth-guard/verified-user-auth.guard';
import { AuthenticUser } from '@/common/decorators/authentic-user.decorator';
import { AuthenticShop } from '@/common/decorators/authentic-shop.decorator';
import { TAuthenticUser, TAuthorizedShop } from '@/common/types';
import { SellerShopGuard } from '@/common/guards/seller-shop-guard/seller-shop.guard';
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

  @Get('my-shop')
  @UseGuards(VerifiedUserAuthGuard, SellerShopGuard)
  async getMyShop(
    @AuthenticShop() shop: TAuthorizedShop,
    @I18nLang() lang: string,
  ): Promise<SuccessResponse<any>> {
    const fullShop = await this.shopService.getShopByUser(shop.ownerId, lang);
    return this.responseService.success({
      message: this.i18n.t('message.success.userRetrieved', { lang }),
      data: fullShop,
    });
  }

  @Patch('my-shop')
  @UseGuards(VerifiedUserAuthGuard, SellerShopGuard)
  async updateMyShop(
    @Body() dto: UpdateShopDto,
    @AuthenticShop() shop: TAuthorizedShop,
    @I18nLang() lang: string,
  ): Promise<SuccessResponse<any>> {
    const updatedShop = await this.shopService.updateMyShop(shop.id, dto, lang);
    return this.responseService.success({
      message: this.i18n.t('message.success.shopUpdated', { lang }),
      data: updatedShop,
    });
  }

  @Patch('my-shop/branding')
  @UseGuards(VerifiedUserAuthGuard, SellerShopGuard)
  async updateMyBranding(
    @Body() dto: UpdateBrandingDto,
    @AuthenticShop() shop: TAuthorizedShop,
    @I18nLang() lang: string,
  ): Promise<SuccessResponse<any>> {
    const updatedShop = await this.shopService.updateMyBranding(
      shop.id,
      dto,
      lang,
    );
    return this.responseService.success({
      message: this.i18n.t('message.success.brandingUpdated', { lang }),
      data: updatedShop,
    });
  }
}
