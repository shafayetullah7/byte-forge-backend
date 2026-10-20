import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { I18nLang, I18nService } from 'nestjs-i18n';
import { ResponseService } from '@/libs/modules/response/response.service';
import { SearchSuggestQuery } from '../application/queries';
import { SearchSuggestQueryDto } from './dto/search-suggest-query.dto';

@ApiTags('🔍 Public - Search')
@Controller({ path: 'search', version: '1' })
export class PublicSearchController {
  constructor(
    private readonly searchSuggestQuery: SearchSuggestQuery,
    private readonly responseService: ResponseService,
    private readonly i18n: I18nService,
  ) {}

  @ApiOperation({
    summary: 'Unified search suggestions',
    description:
      'Returns up to 20 lightweight plant and nursery hits for navbar typeahead. Only active, entitled listings.',
  })
  @ApiResponse({
    status: 200,
    description: 'Search suggestions retrieved successfully',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    type: String,
    description: 'Search query (min 2 characters)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Max items (default 20, max 20)',
  })
  @Get('suggest')
  async suggest(
    @Query() query: SearchSuggestQueryDto,
    @I18nLang() lang: string,
  ) {
    const data = await this.searchSuggestQuery.execute(query, lang);
    return this.responseService.success({
      message: this.i18n.t('message.success.searchSuggestRetrieved', { lang }),
      data,
    });
  }
}
