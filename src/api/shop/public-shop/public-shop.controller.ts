import { Controller, Get, Param, Query } from '@nestjs/common';
import { PublicShopService } from './public-shop.service';
import { ResponseService } from '@/common/modules/response/response.service';
import { PublicShopSlugDto } from './dto/public-shop-slug.dto';
import { I18nLang, I18nService } from 'nestjs-i18n';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiNotFoundResponse } from '@/common/decorators/api-error.decorator';

@ApiTags('🏪 Public - Shops')
@Controller('public/shops')
export class PublicShopController {
  constructor(
    private readonly publicShopService: PublicShopService,
    private readonly responseService: ResponseService,
    private readonly i18n: I18nService,
  ) {}

  @ApiOperation({
    summary: 'Get public shop by slug',
    description: 'Retrieves public shop information without authentication.',
  })
  @ApiResponse({ status: 200, description: 'Public shop retrieved' })
  @ApiNotFoundResponse('Shop')
  @Get(':slug')
  async getPublicShopBySlug(
    @Param() params: PublicShopSlugDto,
    @I18nLang() lang: string,
  ) {
    const shop = await this.publicShopService.getPublicShopBySlug(
      params.slug,
      lang,
    );
    return this.responseService.success({
      message: this.i18n.t('message.success.shopRetrieved', { lang }),
      data: shop,
    });
  }

  @ApiOperation({
    summary: 'Get shipping rate for a shop and district',
    description:
      'Retrieves the shipping cost for a specific shop delivering to a specific district. Returns null if no rate is configured.',
  })
  @ApiResponse({ status: 200, description: 'Shipping rate retrieved' })
  @Get(':shopId/shipping-rate/:districtId')
  async getShippingRate(
    @Param() params: { shopId: string; districtId: string },
  ) {
    const rate = await this.publicShopService.getShippingRate(
      params.shopId,
      params.districtId,
    );
    return this.responseService.success({
      message: 'Shipping rate retrieved',
      data: rate,
    });
  }
}
