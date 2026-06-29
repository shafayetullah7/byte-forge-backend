import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { I18nLang } from 'nestjs-i18n';
import { AdminAuthGuard } from '@/common/guards/admin-auth-guard/admin-auth.guard';
import { ResponseService } from '@/common/modules/response/response.service';
import { AdminUsersService } from './admin-users.service';
import {
  AdminUserIdParamDto,
  AdminUsersQueryDto,
} from './dto/admin-users-query.dto';

@ApiTags('👤 Admin Users')
@Controller({ path: 'admin/users', version: '1' })
@UseGuards(AdminAuthGuard)
export class AdminUsersController {
  constructor(
    private readonly adminUsersService: AdminUsersService,
    private readonly responseService: ResponseService,
  ) {}

  @ApiOperation({ summary: 'Search marketplace users (buyers)' })
  @Get()
  async listUsers(@Query() query: AdminUsersQueryDto) {
    const result = await this.adminUsersService.listUsers(query);
    return this.responseService.paginated({
      message: 'Users retrieved successfully',
      data: result.data,
      meta: result.meta,
    });
  }

  @ApiOperation({ summary: 'Get user profile for support' })
  @Get(':userId')
  async getUser(@Param() params: AdminUserIdParamDto) {
    const data = await this.adminUsersService.getUser(params.userId);
    return this.responseService.success({
      message: 'User retrieved successfully',
      data,
    });
  }

  @ApiOperation({ summary: 'Get recent orders for a user' })
  @Get(':userId/orders')
  async getUserOrders(
    @Param() params: AdminUserIdParamDto,
    @I18nLang() lang: string,
  ) {
    const result = await this.adminUsersService.getUserOrders(
      params.userId,
      lang,
    );
    return this.responseService.paginated({
      message: 'User orders retrieved successfully',
      data: result.data,
      meta: result.meta,
    });
  }
}
