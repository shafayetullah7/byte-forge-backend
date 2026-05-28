import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ShopsService } from './shops.service';
import { AdminAuthGuard } from '@/common/guards/admin-auth-guard/admin-auth.guard';
import { ListShopsDto } from './dto/list-shops.dto';
import { ApproveShopDto } from './dto/approve-shop.dto';
import { RejectShopDto } from './dto/reject-shop.dto';
import { SuspendShopDto } from './dto/suspend-shop.dto';
import { GetShopByIdParamsDto } from './dto/get-shop-by-id-params.dto';

@Controller('admin/shops')
@UseGuards(AdminAuthGuard)
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Get()
  async listShops(@Query() query: ListShopsDto) {
    return this.shopsService.findAll(query);
  }

  @Get(':id')
  async getShop(@Param() params: GetShopByIdParamsDto) {
    return this.shopsService.findOne(params.id);
  }

  @Patch(':id/approve')
  async approveShop(
    @Param() params: GetShopByIdParamsDto,
    @Body() dto: ApproveShopDto,
  ) {
    return this.shopsService.approve(params.id, dto);
  }

  @Patch(':id/reject')
  async rejectShop(
    @Param() params: GetShopByIdParamsDto,
    @Body() dto: RejectShopDto,
  ) {
    return this.shopsService.reject(params.id, dto);
  }

  @Patch(':id/suspend')
  async suspendShop(
    @Param() params: GetShopByIdParamsDto,
    @Body() dto: SuspendShopDto,
  ) {
    return this.shopsService.suspend(params.id, dto);
  }

  @Get(':id/history')
  async getVerificationHistory(@Param() params: GetShopByIdParamsDto) {
    return this.shopsService.getVerificationHistory(params.id);
  }
}
