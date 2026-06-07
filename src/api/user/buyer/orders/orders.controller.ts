import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GetOrdersService } from './services/get-orders.service';
import { GetOrderStatsService } from './services/get-order-stats.service';
import { OrdersFilterDto } from './dto/orders-pagination.dto';
import {
  GetOrdersResponseDto,
  OrderStatsResponseDto,
} from './response/orders-response.dto';
import { ResponseService } from '@/common/modules/response/response.service';
import { I18nLang, I18nService } from 'nestjs-i18n';
import {
  ApiAuth,
  ApiOkResponseTyped,
} from '@/common/decorators/swagger.decorators';
import { ApiUnauthorizedResponse } from '@/common/decorators/api-error.decorator';
import { AuthenticUser } from '@/common/decorators/authentic-user.decorator';
import { TAuthenticUser } from '@/common/types';
import { UserAuthGuard } from '@/common/guards/user-auth-guard/user-auth.guard';

@ApiTags('📦 Buyer Orders')
@Controller({ path: 'user/buyer/orders', version: '1' })
@UseGuards(UserAuthGuard)
export class OrdersController {
  constructor(
    private readonly getOrdersService: GetOrdersService,
    private readonly getOrderStatsService: GetOrderStatsService,
    private readonly responseService: ResponseService,
    private readonly i18n: I18nService,
  ) {}

  @ApiAuth()
  @ApiOperation({
    summary: 'Get buyer orders',
    description:
      'Returns all orders grouped by order group for the authenticated buyer with pagination and filtering.',
  })
  @ApiOkResponseTyped(GetOrdersResponseDto, 'Orders retrieved successfully')
  @ApiUnauthorizedResponse()
  @Get()
  async getOrders(
    @AuthenticUser() authUser: TAuthenticUser,
    @Query() query: OrdersFilterDto,
    @I18nLang() lang: string,
  ) {
    console.log({ lang });
    const result = await this.getOrdersService.execute(
      authUser.user.id,
      query,
      lang,
    );

    return this.responseService.paginated({
      message: this.i18n.t('message.success.ordersRetrieved', { lang }),
      data: result.groups,
      meta: {
        page: query.page ?? 1,
        limit: query.limit ?? 10,
        total: result.total,
      },
    });
  }

  @ApiAuth()
  @ApiOperation({
    summary: 'Get order statistics',
    description:
      'Returns aggregated order statistics (total, active, delivered, cancelled, total spent) for the authenticated buyer.',
  })
  @ApiOkResponseTyped(
    OrderStatsResponseDto,
    'Order statistics retrieved successfully',
  )
  @ApiUnauthorizedResponse()
  @Get('stats')
  async getOrderStats(
    @AuthenticUser() authUser: TAuthenticUser,
    @I18nLang() lang: string,
  ) {
    const stats = await this.getOrderStatsService.execute(authUser.user.id);

    return this.responseService.success({
      message: this.i18n.t('message.success.orderStatsRetrieved', { lang }),
      data: stats,
    });
  }
}
