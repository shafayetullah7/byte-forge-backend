import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseService } from '@/common/modules/response/response.service';
import { PublicReviewsService } from './public-reviews.service';
import { PlantReviewParamDto } from './dto/plant-review-param.dto';
import { ProductReviewParamDto } from './dto/product-review-param.dto';
import { PublicReviewQueryDto } from './dto/public-review-query.dto';

@ApiTags('⭐ Public Reviews')
@Controller({ path: 'reviews', version: '1' })
export class PublicReviewsController {
  constructor(
    private readonly publicReviewsService: PublicReviewsService,
    private readonly responseService: ResponseService,
  ) {}

  @ApiOperation({ summary: 'List approved reviews for a product' })
  @Get('products/:productId')
  async getProductReviews(
    @Param() params: ProductReviewParamDto,
    @Query() query: PublicReviewQueryDto,
  ) {
    const data = await this.publicReviewsService.getProductReviews(
      params.productId,
      query,
    );

    return this.responseService.success({
      message: 'Product reviews retrieved successfully',
      data,
    });
  }

  @ApiOperation({ summary: 'List approved reviews for a plant slug' })
  @Get('plants/:slug')
  async getPlantReviews(
    @Param() params: PlantReviewParamDto,
    @Query() query: PublicReviewQueryDto,
  ) {
    const data = await this.publicReviewsService.getPlantReviews(
      params.slug,
      query,
    );

    return this.responseService.success({
      message: 'Plant reviews retrieved successfully',
      data,
    });
  }
}
