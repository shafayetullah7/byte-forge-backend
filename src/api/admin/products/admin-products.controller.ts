import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { I18nLang } from 'nestjs-i18n';
import { AdminAuthGuard } from '@/common/guards/admin-auth-guard/admin-auth.guard';
import { ResponseService } from '@/common/modules/response/response.service';
import { AdminProductsService } from './admin-products.service';
import {
  AdminProductIdParamDto,
  AdminProductsQueryDto,
  ArchiveProductDto,
} from './dto/admin-products-query.dto';

@ApiTags('🌱 Admin Products')
@Controller({ path: 'admin/products', version: '1' })
@UseGuards(AdminAuthGuard)
export class AdminProductsController {
  constructor(
    private readonly adminProductsService: AdminProductsService,
    private readonly responseService: ResponseService,
  ) {}

  @ApiOperation({ summary: 'List products for moderation' })
  @Get()
  async listProducts(
    @Query() query: AdminProductsQueryDto,
    @I18nLang() lang: string,
  ) {
    const result = await this.adminProductsService.listProducts(query, lang);
    return this.responseService.paginated({
      message: 'Products retrieved successfully',
      data: result.data,
      meta: result.meta,
    });
  }

  @ApiOperation({ summary: 'Get product detail' })
  @Get(':productId')
  async getProduct(
    @Param() params: AdminProductIdParamDto,
    @I18nLang() lang: string,
  ) {
    const data = await this.adminProductsService.getProduct(
      params.productId,
      lang,
    );
    return this.responseService.success({
      message: 'Product retrieved successfully',
      data,
    });
  }

  @ApiOperation({ summary: 'Archive a product (hide from public catalog)' })
  @Patch(':productId/archive')
  async archiveProduct(
    @Param() params: AdminProductIdParamDto,
    @Body() dto: ArchiveProductDto,
  ) {
    const result = await this.adminProductsService.archiveProduct(
      params.productId,
      dto,
    );
    return this.responseService.success({
      message: result.message,
      data: null,
    });
  }

  @ApiOperation({ summary: 'Restore an archived product to active' })
  @Patch(':productId/restore')
  async restoreProduct(@Param() params: AdminProductIdParamDto) {
    const result = await this.adminProductsService.restoreProduct(
      params.productId,
    );
    return this.responseService.success({
      message: result.message,
      data: null,
    });
  }
}
