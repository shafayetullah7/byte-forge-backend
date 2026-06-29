import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { I18nLang } from 'nestjs-i18n';
import { AdminAuthGuard } from '@/common/guards/admin-auth-guard/admin-auth.guard';
import { ResponseService } from '@/common/modules/response/response.service';
import { AdminOrdersService } from './admin-orders.service';
import {
  AdminOrderIdParamDto,
  AdminOrderStatsQueryDto,
  AdminOrdersQueryDto,
} from './dto/admin-orders-query.dto';

@ApiTags('📦 Admin Orders')
@Controller({ path: 'admin/orders', version: '1' })
@UseGuards(AdminAuthGuard)
export class AdminOrdersController {
  constructor(
    private readonly adminOrdersService: AdminOrdersService,
    private readonly responseService: ResponseService,
  ) {}

  @ApiOperation({ summary: 'List orders across all shops' })
  @Get()
  async listOrders(
    @Query() query: AdminOrdersQueryDto,
    @I18nLang() lang: string,
  ) {
    const result = await this.adminOrdersService.listOrders(query, lang);
    return this.responseService.paginated({
      message: 'Orders retrieved successfully',
      data: result.data,
      meta: result.meta,
    });
  }

  @ApiOperation({ summary: 'Get order counts by status' })
  @Get('stats')
  async getOrderStats(@Query() query: AdminOrderStatsQueryDto) {
    const data = await this.adminOrdersService.getOrderStats(query);
    return this.responseService.success({
      message: 'Order stats retrieved successfully',
      data,
    });
  }

  @ApiOperation({ summary: 'Get order detail' })
  @Get(':orderId')
  async getOrder(
    @Param() params: AdminOrderIdParamDto,
    @I18nLang() lang: string,
  ) {
    const data = await this.adminOrdersService.getOrder(params.orderId, lang);
    return this.responseService.success({
      message: 'Order retrieved successfully',
      data,
    });
  }
}
