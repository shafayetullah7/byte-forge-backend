import { Controller, Get, Param } from '@nestjs/common';
import { PublicShopService } from './public-shop.service';
import { ResponseService } from '@/common/modules/response/response.service';
import { PublicShopSlugDto } from './dto/public-shop-slug.dto';
import { I18nLang, I18nService } from 'nestjs-i18n';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Public Shops')
@Controller('public/shops')
export class PublicShopController {
  constructor(
    private readonly publicShopService: PublicShopService,
    private readonly responseService: ResponseService,
    private readonly i18n: I18nService,
  ) {}

  @Get(':slug')
  @ApiOperation({ summary: 'Get public shop by slug' })
  @ApiResponse({ status: 200, description: 'Public shop retrieved' })
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
}
