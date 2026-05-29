import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ShippingRatesService, ShippingRate } from './shipping-rates.service';
import { BulkUpdateShippingRatesDto } from './dto/update-shipping-rates.dto';
import { VerifiedUserAuthGuard } from '@/common/guards/verified-user-auth-guard/verified-user-auth.guard';
import { TAuthorizedShop } from '@/common/types';
import { AuthenticShop } from '@/common/decorators/authentic-shop.decorator';
import { SellerShopGuard } from '@/common/guards/seller-shop-guard/seller-shop.guard';
import { ResponseService } from '@/common/modules/response/response.service';
import { SuccessResponse } from '@/common/modules/response/dto/success.response.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { I18nLang, I18nService } from 'nestjs-i18n';
import { ApiAuth } from '@/common/decorators/swagger.decorators';
import {
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@/common/decorators/api-error.decorator';

@ApiTags('🚚 Seller - Shipping Rates')
@Controller({ path: 'user/seller/shipping-rates', version: '1' })
export class ShippingRatesController {
  constructor(
    private readonly shippingRatesService: ShippingRatesService,
    private readonly responseService: ResponseService,
    private readonly i18n: I18nService,
  ) {}

  @ApiAuth()
  @ApiOperation({
    summary: 'Get shipping rates per district',
    description:
      "Returns all district shipping rates configured for the seller's shop",
  })
  @ApiResponse({ status: 200, description: 'Shipping rates retrieved' })
  @ApiUnauthorizedResponse()
  @Get('my-shop')
  @UseGuards(VerifiedUserAuthGuard, SellerShopGuard)
  async getShippingRates(
    @AuthenticShop() shop: TAuthorizedShop,
    @I18nLang() lang: string,
  ): Promise<SuccessResponse<ShippingRate[]>> {
    const rates = await this.shippingRatesService.getShippingRates(shop.id);
    return this.responseService.success({
      message: this.i18n.t('message.success.shippingRatesRetrieved', { lang }),
      data: rates,
    });
  }

  @ApiAuth()
  @ApiOperation({
    summary: 'Bulk update shipping rates',
    description:
      'Upserts shipping rates for multiple districts at once. Only the districts provided in the request are updated; existing rates for other districts remain unchanged.',
  })
  @ApiResponse({ status: 200, description: 'Shipping rates updated' })
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  @Put('my-shop')
  @UseGuards(VerifiedUserAuthGuard, SellerShopGuard)
  async bulkUpdateShippingRates(
    @Body() dto: BulkUpdateShippingRatesDto,
    @AuthenticShop() shop: TAuthorizedShop,
    @I18nLang() lang: string,
  ): Promise<SuccessResponse<ShippingRate[]>> {
    const rates = await this.shippingRatesService.bulkUpdateShippingRates(
      shop.id,
      dto.rates,
      lang,
    );
    return this.responseService.success({
      message: this.i18n.t('message.success.shippingRatesUpdated', { lang }),
      data: rates,
    });
  }
}
