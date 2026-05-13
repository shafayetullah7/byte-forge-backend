import {
  Controller,
  Get,
  Logger,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { ListProductsQueryDto } from './dto/list-products-query.dto';
import { VerifiedUserAuthGuard } from '@/common/guards/verified-user-auth-guard/verified-user-auth.guard';
import { AuthenticUser } from '@/common/decorators/authentic-user.decorator';
import { TAuthenticUser } from '@/common/types';
import { ResponseService } from '@/common/modules/response/response.service';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { I18nLang, I18nService } from 'nestjs-i18n';
import { ApiAuth, ApiPaginatedResponse } from '@/common/decorators/swagger.decorators';
import { ApiNotFoundResponse, ApiUnauthorizedResponse } from '@/common/decorators/api-error.decorator';
import { ZodValidationPipe } from 'nestjs-zod';
import { ProductListItemResponseDto, ProductDetailResponseDto } from './dto/products-response.dto';
import { ProductStatusEnum, ProductTypeEnum } from '@/_db/drizzle/enum';

@ApiTags('📦 Seller - Products Management')
@Controller({ path: 'user/seller/products', version: '1' })
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);

  constructor(
    private readonly productsService: ProductsService,
    private readonly responseService: ResponseService,
    private readonly i18n: I18nService,
  ) {}

  @ApiAuth()
  @ApiOperation({
    summary: 'List products',
    description: 'Returns a paginated list of all products for the authenticated seller',
  })
  @ApiPaginatedResponse(ProductListItemResponseDto)
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by name or slug',
  })
  @ApiQuery({
    name: 'productType',
    required: false,
    enum: ProductTypeEnum,
    description: 'Filter by product type',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ProductStatusEnum,
    description: 'Filter by product status',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'updatedAt', 'name', 'price', 'inventory'],
    default: 'createdAt',
    description: 'Sort field',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    default: 'desc',
    description: 'Sort direction',
  })
  @ApiUnauthorizedResponse()
  @Get()
  @UseGuards(VerifiedUserAuthGuard)
  async getProducts(
    @Query(new ZodValidationPipe(ListProductsQueryDto.schema)) query: ListProductsQueryDto,
    @AuthenticUser() authenticUser: TAuthenticUser,
    @I18nLang() lang: string,
  ) {
    this.logger.log(
      `Fetching products for user ${authenticUser.user.id} | Query: ${JSON.stringify(query)}`,
    );
    try {
      const result = await this.productsService.getProducts(authenticUser.user.id, query, lang);
      this.logger.log(`Successfully fetched ${result.data.length} products`);
      return this.responseService.paginated({
        message: this.i18n.t('message.success.productsRetrieved', { lang }),
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      this.logger.error(
        `Failed to fetch products for user ${authenticUser.user.id} | Query: ${JSON.stringify(query)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  @ApiAuth()
  @ApiOperation({
    summary: 'Get product by ID',
    description: 'Returns full product details including thumbnail and variant information',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Product ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Product details retrieved successfully',
    type: ProductDetailResponseDto,
  })
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse('Product not found')
  @Get(':id')
  @UseGuards(VerifiedUserAuthGuard)
  async getProductById(
    @Param('id') id: string,
    @AuthenticUser() authenticUser: TAuthenticUser,
    @I18nLang() lang: string,
  ) {
    this.logger.log(
      `Fetching product ${id} for user ${authenticUser.user.id}`,
    );
    try {
      const product = await this.productsService.getProductById(authenticUser.user.id, id, lang);
      this.logger.log(`Successfully fetched product ${id}`);
      return this.responseService.success({
        message: this.i18n.t('message.success.productRetrieved', { lang }),
        data: product,
      });
    } catch (error) {
      this.logger.error(
        `Failed to fetch product ${id} for user ${authenticUser.user.id}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
