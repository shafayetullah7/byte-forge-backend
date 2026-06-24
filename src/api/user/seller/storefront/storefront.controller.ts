import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { I18nLang, I18nService } from 'nestjs-i18n';
import { VerifiedUserAuthGuard } from '@/common/guards/verified-user-auth-guard/verified-user-auth.guard';
import { SellerShopGuard } from '@/common/guards/seller-shop-guard/seller-shop.guard';
import { AuthenticShop } from '@/common/decorators/authentic-shop.decorator';
import { TAuthorizedShop } from '@/common/types';
import { ResponseService } from '@/common/modules/response/response.service';
import { ApiAuth } from '@/common/decorators/swagger.decorators';
import {
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@/common/decorators/api-error.decorator';
import { GetStorefrontService } from './services/get-storefront.service';
import { UpdateStorefrontProfileService } from './services/update-storefront-profile.service';
import {
  ReplaceValuePointsService,
  ReplaceWhyChooseUsService,
} from './services/replace-storefront-lists.service';
import { UpdateStorefrontProfileDto } from './dto/update-storefront-profile.dto';
import { ReplaceStorefrontListDto } from './dto/replace-storefront-list.dto';

@ApiTags('🏪 Seller - Storefront')
@Controller({ path: 'user/seller/storefront', version: '1' })
export class StorefrontController {
  constructor(
    private readonly getStorefrontService: GetStorefrontService,
    private readonly updateStorefrontProfileService: UpdateStorefrontProfileService,
    private readonly replaceWhyChooseUsService: ReplaceWhyChooseUsService,
    private readonly replaceValuePointsService: ReplaceValuePointsService,
    private readonly responseService: ResponseService,
    private readonly i18n: I18nService,
  ) {}

  @ApiAuth()
  @ApiOperation({ summary: 'Get seller storefront content' })
  @ApiResponse({ status: 200, description: 'Storefront retrieved' })
  @ApiUnauthorizedResponse()
  @Get()
  @UseGuards(VerifiedUserAuthGuard, SellerShopGuard)
  async getStorefront(
    @AuthenticShop() shop: TAuthorizedShop,
    @I18nLang() lang: string,
  ) {
    const data = await this.getStorefrontService.execute(shop.id, lang);
    return this.responseService.success({
      message: this.i18n.t('message.success.storefrontRetrieved', {
        lang,
        defaultValue: 'Storefront retrieved successfully',
      }),
      data,
    });
  }

  @ApiAuth()
  @ApiOperation({ summary: 'Update storefront profile copy' })
  @ApiResponse({ status: 200, description: 'Storefront profile updated' })
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  @Put('profile')
  @UseGuards(VerifiedUserAuthGuard, SellerShopGuard)
  async updateProfile(
    @AuthenticShop() shop: TAuthorizedShop,
    @Body() dto: UpdateStorefrontProfileDto,
    @I18nLang() lang: string,
  ) {
    const data = await this.updateStorefrontProfileService.execute(
      shop.id,
      dto,
      lang,
    );
    return this.responseService.success({
      message: this.i18n.t('message.success.storefrontProfileUpdated', {
        lang,
        defaultValue: 'Storefront profile updated successfully',
      }),
      data,
    });
  }

  @ApiAuth()
  @ApiOperation({ summary: 'Replace why choose us list' })
  @ApiResponse({ status: 200, description: 'Why choose us updated' })
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  @Put('why-choose-us')
  @UseGuards(VerifiedUserAuthGuard, SellerShopGuard)
  async replaceWhyChooseUs(
    @AuthenticShop() shop: TAuthorizedShop,
    @Body() dto: ReplaceStorefrontListDto,
    @I18nLang() lang: string,
  ) {
    const data = await this.replaceWhyChooseUsService.execute(
      shop.id,
      dto,
      lang,
    );
    return this.responseService.success({
      message: this.i18n.t('message.success.storefrontWhyChooseUsUpdated', {
        lang,
        defaultValue: 'Why choose us updated successfully',
      }),
      data,
    });
  }

  @ApiAuth()
  @ApiOperation({ summary: 'Replace value points list' })
  @ApiResponse({ status: 200, description: 'Value points updated' })
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  @Put('value-points')
  @UseGuards(VerifiedUserAuthGuard, SellerShopGuard)
  async replaceValuePoints(
    @AuthenticShop() shop: TAuthorizedShop,
    @Body() dto: ReplaceStorefrontListDto,
    @I18nLang() lang: string,
  ) {
    const data = await this.replaceValuePointsService.execute(
      shop.id,
      dto,
      lang,
    );
    return this.responseService.success({
      message: this.i18n.t('message.success.storefrontValuePointsUpdated', {
        lang,
        defaultValue: 'Value points updated successfully',
      }),
      data,
    });
  }
}
