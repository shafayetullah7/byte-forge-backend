import { Controller, Get, Param, Query } from '@nestjs/common';
import { PublicShopService } from '../services/public-shop.service';
import { ResponseService } from '@/common/modules/response/response.service';
import { PublicShopSlugDto } from '../dto/public-shop-slug.dto';
import { ListPublicShopsQueryDto } from '../dto/list-public-shops-query.dto';
import { ListPublicShopProductsQueryDto } from '../dto/list-public-shop-products-query.dto';
import { ListPublicShopReviewsQueryDto } from '../dto/list-public-shop-reviews-query.dto';
import {
  PublicShopCampaignSlugDto,
  PublicShopArticleSlugDto,
} from '../dto/public-shop-content-slug.dto';
import { I18nLang, I18nService } from 'nestjs-i18n';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiNotFoundResponse } from '@/common/decorators/api-error.decorator';
import { ApiAuth } from '@/common/decorators/swagger.decorators';

@ApiTags('🏪 Public - Shops')
@Controller({ path: 'shops', version: '1' })
export class PublicShopController {
  constructor(
    private readonly publicShopService: PublicShopService,
    private readonly responseService: ResponseService,
    private readonly i18n: I18nService,
  ) {}

  @ApiAuth()
  @ApiOperation({ summary: 'List verified public shops' })
  @ApiResponse({ status: 200, description: 'Shops retrieved' })
  @Get()
  async listShops(
    @Query() query: ListPublicShopsQueryDto,
    @I18nLang() lang: string,
  ) {
    const result = await this.publicShopService.listShops(query, lang);
    return this.responseService.paginated({
      message: this.i18n.t('message.success.shopsRetrieved', {
        lang,
        defaultValue: this.i18n.t('message.success.shopRetrieved', { lang }),
      }),
      data: result.data,
      meta: result.meta,
    });
  }

  @ApiAuth()
  @ApiOperation({ summary: 'Get shop products by slug' })
  @ApiResponse({ status: 200, description: 'Shop products retrieved' })
  @ApiNotFoundResponse('Shop')
  @Get(':slug/products')
  async listShopProducts(
    @Param() params: PublicShopSlugDto,
    @Query() query: ListPublicShopProductsQueryDto,
    @I18nLang() lang: string,
  ) {
    const result = await this.publicShopService.listShopProducts(
      params.slug,
      query,
      lang,
    );
    return this.responseService.paginated({
      message: this.i18n.t('message.success.shopProductsRetrieved', {
        lang,
        defaultValue: 'Shop products retrieved successfully',
      }),
      data: result.data,
      meta: result.meta,
    });
  }

  @ApiAuth()
  @ApiOperation({ summary: 'Get shop reviews by slug' })
  @ApiResponse({ status: 200, description: 'Shop reviews retrieved' })
  @ApiNotFoundResponse('Shop')
  @Get(':slug/reviews')
  async listShopReviews(
    @Param() params: PublicShopSlugDto,
    @Query() query: ListPublicShopReviewsQueryDto,
    @I18nLang() lang: string,
  ) {
    const result = await this.publicShopService.getShopReviews(
      params.slug,
      query,
      lang,
    );
    return this.responseService.success({
      message: this.i18n.t('message.success.shopReviewsRetrieved', {
        lang,
        defaultValue: 'Shop reviews retrieved successfully',
      }),
      data: result,
    });
  }

  @ApiAuth()
  @ApiOperation({ summary: 'Get shop campaign highlights' })
  @Get(':slug/campaigns/highlights')
  async getCampaignHighlights(@Param() params: PublicShopSlugDto) {
    const data = await this.publicShopService.getShopCampaignHighlights(
      params.slug,
    );
    return this.responseService.success({
      message: 'Campaign highlights retrieved successfully',
      data,
    });
  }

  @ApiAuth()
  @ApiOperation({ summary: 'Get shop campaign detail' })
  @Get(':slug/campaigns/:campaignSlug')
  async getCampaignDetail(
    @Param() params: PublicShopCampaignSlugDto,
    @I18nLang() lang: string,
  ) {
    const data = await this.publicShopService.getShopCampaignDetail(
      params.slug,
      params.campaignSlug,
      lang,
    );
    return this.responseService.success({
      message: 'Campaign retrieved successfully',
      data,
    });
  }

  @ApiAuth()
  @ApiOperation({ summary: 'List shop campaigns' })
  @Get(':slug/campaigns')
  async listCampaigns(
    @Param() params: PublicShopSlugDto,
    @I18nLang() lang: string,
  ) {
    const data = await this.publicShopService.listShopCampaigns(
      params.slug,
      lang,
    );
    return this.responseService.success({
      message: 'Campaigns retrieved successfully',
      data,
    });
  }

  @ApiAuth()
  @ApiOperation({ summary: 'Get shop article detail' })
  @Get(':slug/articles/:articleSlug')
  async getArticleDetail(
    @Param() params: PublicShopArticleSlugDto,
    @I18nLang() lang: string,
  ) {
    const data = await this.publicShopService.getShopArticleDetail(
      params.slug,
      params.articleSlug,
      lang,
    );
    return this.responseService.success({
      message: 'Article retrieved successfully',
      data,
    });
  }

  @ApiAuth()
  @ApiOperation({ summary: 'List shop articles' })
  @Get(':slug/articles')
  async listArticles(
    @Param() params: PublicShopSlugDto,
    @I18nLang() lang: string,
  ) {
    const data = await this.publicShopService.listShopArticles(
      params.slug,
      lang,
    );
    return this.responseService.success({
      message: 'Articles retrieved successfully',
      data,
    });
  }

  @ApiAuth()
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
}
