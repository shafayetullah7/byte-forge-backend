import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GetOrdersService } from './services/get-orders.service';
import { OrdersFilterDto } from './dto/orders-pagination.dto';
import { GetOrdersResponseDto, OrderGroupResponseDto } from './response/orders-response.dto';
import { ResponseService } from '@/common/modules/response/response.service';
import { I18nLang, I18nService } from 'nestjs-i18n';
import { ApiAuth, ApiOkResponseTyped } from '@/common/decorators/swagger.decorators';
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
    private readonly responseService: ResponseService,
    private readonly i18n: I18nService,
  ) {}

  @ApiAuth()
  @ApiOperation({
    summary: 'Get buyer orders',
    description:
      'Returns all orders grouped by order group for the authenticated buyer with pagination, filtering, and stats.',
  })
  @ApiOkResponseTyped(GetOrdersResponseDto, 'Orders retrieved successfully')
  @ApiUnauthorizedResponse()
  @Get()
  async getOrders(
    @AuthenticUser() authUser: TAuthenticUser,
    @Query() query: OrdersFilterDto,
    @I18nLang() lang: string,
  ) {
    const result = await this.getOrdersService.execute(authUser.user.id, query);

    return this.responseService.success({
      message: this.i18n.t('message.success.ordersRetrieved', { lang }),
      data: {
        groups: result.groups,
        stats: result.stats,
        meta: {
          page: query.page ?? 1,
          limit: query.limit ?? 10,
          total: result.total,
        },
      },
    });
  }
}
