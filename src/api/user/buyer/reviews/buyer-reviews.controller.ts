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
import { I18nLang } from 'nestjs-i18n';
import { AuthenticUser } from '@/common/decorators/authentic-user.decorator';
import { TAuthenticUser } from '@/common/types';
import { UserAuthGuard } from '@/common/guards/user-auth-guard/user-auth.guard';
import { ResponseService } from '@/common/modules/response/response.service';
import { BuyerReviewsService } from './buyer-reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ListBuyerReviewsQueryDto } from './dto/list-buyer-reviews-query.dto';
import { OrderItemParamDto } from './dto/order-item-param.dto';

@ApiTags('⭐ Buyer Reviews')
@Controller({ path: 'user/buyer/reviews', version: '1' })
@UseGuards(UserAuthGuard)
export class BuyerReviewsController {
  constructor(
    private readonly buyerReviewsService: BuyerReviewsService,
    private readonly responseService: ResponseService,
  ) {}

  @ApiOperation({ summary: 'List reviews written by the authenticated buyer' })
  @Get()
  async listReviews(
    @AuthenticUser() authUser: TAuthenticUser,
    @Query() query: ListBuyerReviewsQueryDto,
    @I18nLang() lang: string,
  ) {
    const result = await this.buyerReviewsService.listReviews(
      authUser.user.id,
      query,
      lang,
    );

    return this.responseService.paginated({
      message: 'Reviews retrieved successfully',
      data: result.data,
      meta: result.meta,
    });
  }

  @ApiOperation({ summary: 'Check if an order item can be reviewed' })
  @Get('eligibility/:orderItemId')
  async getEligibility(
    @AuthenticUser() authUser: TAuthenticUser,
    @Param() params: OrderItemParamDto,
  ) {
    const data = await this.buyerReviewsService.getEligibility(
      authUser.user.id,
      params.orderItemId,
    );

    return this.responseService.success({
      message: 'Review eligibility retrieved successfully',
      data,
    });
  }

  @ApiOperation({ summary: 'Create a verified purchase review' })
  @Post()
  async createReview(
    @AuthenticUser() authUser: TAuthenticUser,
    @Body() dto: CreateReviewDto,
  ) {
    const data = await this.buyerReviewsService.createReview(
      authUser.user.id,
      dto,
    );

    return this.responseService.success({
      message: 'Review submitted for moderation',
      data,
    });
  }
}
