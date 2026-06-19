import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticUser } from '@/common/decorators/authentic-user.decorator';
import { TAuthenticUser } from '@/common/types';
import { VerifiedUserAuthGuard } from '@/common/guards/verified-user-auth-guard/verified-user-auth.guard';
import { ResponseService } from '@/common/modules/response/response.service';
import { ProductIdParamDto } from './dto/product-id-param.dto';
import { SellerReviewQueryDto } from './dto/seller-review-query.dto';
import { SellerReviewsService } from './seller-reviews.service';
import { ReviewIdParamDto } from './dto/review-id-param.dto';
import { ReportReviewDto } from './dto/report-review.dto';

@ApiTags('⭐ Seller Reviews')
@Controller({ path: 'user/seller', version: '1' })
@UseGuards(VerifiedUserAuthGuard)
export class SellerReviewsController {
  constructor(
    private readonly sellerReviewsService: SellerReviewsService,
    private readonly responseService: ResponseService,
  ) {}

  @ApiOperation({ summary: 'List reviews for a seller product' })
  @Get('products/:productId/reviews')
  async getProductReviews(
    @AuthenticUser() authUser: TAuthenticUser,
    @Param() params: ProductIdParamDto,
    @Query() query: SellerReviewQueryDto,
  ) {
    const data = await this.sellerReviewsService.getProductReviews(
      authUser.user.id,
      params.productId,
      query,
    );

    return this.responseService.success({
      message: 'Product reviews retrieved successfully',
      data,
    });
  }

  @ApiOperation({ summary: 'Report a review to admin' })
  @Post('reviews/:reviewId/report')
  async reportReview(
    @AuthenticUser() authUser: TAuthenticUser,
    @Param() params: ReviewIdParamDto,
    @Body() body: ReportReviewDto,
  ) {
    const data = await this.sellerReviewsService.reportReview(
      authUser.user.id,
      params.reviewId,
      body,
    );

    return this.responseService.success({
      message: 'Review reported successfully',
      data,
    });
  }
}
