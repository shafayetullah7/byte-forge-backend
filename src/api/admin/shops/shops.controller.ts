import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ShopsService } from './shops.service';
import { AdminAuthGuard } from '@/common/guards/admin-auth-guard/admin-auth.guard';
import { ListShopsDto } from './dto/list-shops.dto';
import { ApproveShopDto } from './dto/approve-shop.dto';
import { RejectShopDto } from './dto/reject-shop.dto';
import { SuspendShopDto } from './dto/suspend-shop.dto';

@Controller('admin/shops')
@UseGuards(AdminAuthGuard)
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Get()
  async listShops(@Query() query: ListShopsDto) {
    return this.shopsService.findAll(query);
  }

  @Get(':id')
  async getShop(@Param('id') id: string) {
    return this.shopsService.findOne(id);
  }

  @Patch(':id/approve')
  async approveShop(@Param('id') id: string, @Body() dto: ApproveShopDto) {
    return this.shopsService.approve(id, dto);
  }

  @Patch(':id/reject')
  async rejectShop(@Param('id') id: string, @Body() dto: RejectShopDto) {
    if (!dto.reason || dto.reason.trim().length < 10) {
      throw new BadRequestException(
        'Rejection reason must be at least 10 characters',
      );
    }
    return this.shopsService.reject(id, dto);
  }

  @Patch(':id/suspend')
  async suspendShop(@Param('id') id: string, @Body() dto: SuspendShopDto) {
    if (!dto.reason || dto.reason.trim().length < 10) {
      throw new BadRequestException(
        'Suspension reason must be at least 10 characters',
      );
    }
    return this.shopsService.suspend(id, dto);
  }

  @Get(':id/history')
  async getVerificationHistory(@Param('id') id: string) {
    return this.shopsService.getVerificationHistory(id);
  }
}
