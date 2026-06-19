import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { VerifiedUserAuthGuard } from '@/common/guards/verified-user-auth-guard/verified-user-auth.guard';
import { SellerShopGuard } from '@/common/guards/seller-shop-guard/seller-shop.guard';
import { AuthenticShop } from '@/common/decorators/authentic-shop.decorator';
import { AuthenticUser } from '@/common/decorators/authentic-user.decorator';
import { TAuthorizedShop, TAuthenticUser } from '@/common/types';
import { ResponseService } from '@/common/modules/response/response.service';
import { I18nLang, I18nService } from 'nestjs-i18n';
import { ApiAuth } from '@/common/decorators/swagger.decorators';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@/common/decorators/api-error.decorator';
import { GetSellerOrdersService } from './services/get-seller-orders.service';
import { GetSellerOrderStatsService } from './services/get-seller-order-stats.service';
import { GetSellerOrderService } from './services/get-seller-order.service';
import { UpdateSellerOrderStatusService } from './services/update-seller-order-status.service';
import { ShipSellerOrderService } from './services/ship-seller-order.service';
import { CancelSellerOrderService } from './services/cancel-seller-order.service';
import {
  OrderIdParamDto,
  SellerOrdersFilterDto,
} from './dto/seller-orders-filter.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ShipOrderDto } from './dto/ship-order.dto';
import { CancelSellerOrderDto } from './dto/cancel-order.dto';

@ApiTags('📦 Seller - Orders')
@Controller({ path: 'user/seller/orders', version: '1' })
export class SellerOrdersController {
  constructor(
    private readonly getSellerOrdersService: GetSellerOrdersService,
    private readonly getSellerOrderStatsService: GetSellerOrderStatsService,
    private readonly getSellerOrderService: GetSellerOrderService,
    private readonly updateSellerOrderStatusService: UpdateSellerOrderStatusService,
    private readonly shipSellerOrderService: ShipSellerOrderService,
    private readonly cancelSellerOrderService: CancelSellerOrderService,
    private readonly responseService: ResponseService,
    private readonly i18n: I18nService,
  ) {}

  @ApiAuth()
  @ApiOperation({ summary: 'List shop orders' })
  @ApiUnauthorizedResponse()
  @Get()
  @UseGuards(VerifiedUserAuthGuard, SellerShopGuard)
  async getOrders(
    @AuthenticShop() shop: TAuthorizedShop,
    @Query() query: SellerOrdersFilterDto,
    @I18nLang() lang: string,
  ) {
    const result = await this.getSellerOrdersService.execute(
      shop.id,
      query,
      lang,
    );

    return this.responseService.paginated({
      message: this.i18n.t('message.success.ordersRetrieved', { lang }),
      data: result.orders,
      meta: {
        page: query.page ?? 1,
        limit: query.limit ?? 10,
        total: result.total,
      },
    });
  }

  @ApiAuth()
  @ApiOperation({ summary: 'Get shop order statistics' })
  @ApiUnauthorizedResponse()
  @Get('stats')
  @UseGuards(VerifiedUserAuthGuard, SellerShopGuard)
  async getStats(
    @AuthenticShop() shop: TAuthorizedShop,
    @I18nLang() lang: string,
  ) {
    const stats = await this.getSellerOrderStatsService.execute(shop.id);

    return this.responseService.success({
      message: this.i18n.t('message.success.orderStatsRetrieved', { lang }),
      data: stats,
    });
  }

  @ApiAuth()
  @ApiOperation({ summary: 'Get order detail' })
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse()
  @Get(':orderId')
  @UseGuards(VerifiedUserAuthGuard, SellerShopGuard)
  async getOrder(
    @AuthenticShop() shop: TAuthorizedShop,
    @Param() params: OrderIdParamDto,
    @I18nLang() lang: string,
  ) {
    const data = await this.getSellerOrderService.execute(
      shop,
      params.orderId,
      lang,
    );

    return this.responseService.success({
      message: this.i18n.t('message.success.orderGroupRetrieved', { lang }),
      data,
    });
  }

  @ApiAuth()
  @ApiOperation({ summary: 'Update order status' })
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  @Patch(':orderId/status')
  @UseGuards(VerifiedUserAuthGuard, SellerShopGuard)
  async updateStatus(
    @AuthenticShop() shop: TAuthorizedShop,
    @AuthenticUser() authUser: TAuthenticUser,
    @Param() params: OrderIdParamDto,
    @Body() body: UpdateOrderStatusDto,
    @I18nLang() lang: string,
  ) {
    const data = await this.updateSellerOrderStatusService.execute(
      shop,
      params.orderId,
      authUser.user.id,
      body,
      lang,
    );

    return this.responseService.success({
      message: this.i18n.t('message.success.orderUpdated', { lang }),
      data,
    });
  }

  @ApiAuth()
  @ApiOperation({ summary: 'Ship order with tracking' })
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  @Post(':orderId/ship')
  @UseGuards(VerifiedUserAuthGuard, SellerShopGuard)
  async shipOrder(
    @AuthenticShop() shop: TAuthorizedShop,
    @AuthenticUser() authUser: TAuthenticUser,
    @Param() params: OrderIdParamDto,
    @Body() body: ShipOrderDto,
    @I18nLang() lang: string,
  ) {
    const data = await this.shipSellerOrderService.execute(
      shop,
      params.orderId,
      authUser.user.id,
      body,
      lang,
    );

    return this.responseService.success({
      message: this.i18n.t('message.success.orderShipped', { lang }),
      data,
    });
  }

  @ApiAuth()
  @ApiOperation({ summary: 'Cancel order' })
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  @Patch(':orderId/cancel')
  @UseGuards(VerifiedUserAuthGuard, SellerShopGuard)
  async cancelOrder(
    @AuthenticShop() shop: TAuthorizedShop,
    @AuthenticUser() authUser: TAuthenticUser,
    @Param() params: OrderIdParamDto,
    @Body() body: CancelSellerOrderDto,
    @I18nLang() lang: string,
  ) {
    const data = await this.cancelSellerOrderService.execute(
      shop,
      params.orderId,
      authUser.user.id,
      body,
      lang,
    );

    return this.responseService.success({
      message: this.i18n.t('message.success.orderCancelled', { lang }),
      data,
    });
  }
}
