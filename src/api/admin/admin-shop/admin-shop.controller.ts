import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminShopService } from './admin-shop.service';
import { VerifyShopDto } from './dto/verify-shop.dto';
import { AdminAuthGuard } from '@/common/guards/admin-auth-guard/admin-auth.guard';
import { ResponseService } from '@/common/modules/response/response.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { I18nLang, I18nService } from 'nestjs-i18n';

@ApiTags('Admin Shops')
@Controller({ path: 'admin/shops', version: '1' })
export class AdminShopController {
  constructor(
    private readonly adminShopService: AdminShopService,
    private readonly responseService: ResponseService,
    private readonly i18n: I18nService,
  ) {}

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all pending shop verifications' })
  @ApiResponse({ status: 200, description: 'Pending verifications retrieved' })
  @Get('pending-verifications')
  @UseGuards(AdminAuthGuard)
  async getPendingVerifications(@I18nLang() lang: string) {
    const verifications = await this.adminShopService.getPendingVerifications();
    return this.responseService.success({
      message: this.i18n.t('message.success.userRetrieved', { lang }),
      data: verifications,
    });
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Verify/Approve a shop' })
  @ApiResponse({ status: 200, description: 'Shop verification updated' })
  @Post(':id/verify')
  @UseGuards(AdminAuthGuard)
  async verifyShop(
    @Param('id') id: string,
    @Body() dto: VerifyShopDto,
    @I18nLang() lang: string,
  ) {
    const verification = await this.adminShopService.verifyShop(id, dto);
    return this.responseService.success({
      message: this.i18n.t('message.success.shopUpdated', { lang }),
      data: verification,
    });
  }
}
