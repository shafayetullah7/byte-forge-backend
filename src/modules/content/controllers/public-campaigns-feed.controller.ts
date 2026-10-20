import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { I18nLang } from 'nestjs-i18n';
import { ApiAuth } from '@/libs/decorators/swagger.decorators';
import { ResponseService } from '@/libs/modules/response/response.service';
import { ListPublicCampaignsFeedQuery } from '../application/queries';
import { ListCampaignsFeedQueryDto } from './dto/list-campaigns-feed-query.dto';

@ApiTags('🏷️ Public - Campaigns')
@Controller({ path: 'campaigns', version: '1' })
export class PublicCampaignsFeedController {
  constructor(
    private readonly listPublicCampaignsFeedQuery: ListPublicCampaignsFeedQuery,
    private readonly responseService: ResponseService,
  ) {}

  @ApiAuth()
  @ApiOperation({
    summary: 'Cross-shop campaign feed',
    description:
      'Approved, in-window campaigns from active shops with seller entitlement. Sorted by soonest end date.',
  })
  @Get('feed')
  async listFeed(
    @Query() query: ListCampaignsFeedQueryDto,
    @I18nLang() lang: string,
  ) {
    const result = await this.listPublicCampaignsFeedQuery.execute(query, lang);
    return this.responseService.paginated({
      message: 'Campaign feed retrieved successfully',
      data: result.data,
      meta: result.meta,
    });
  }
}
