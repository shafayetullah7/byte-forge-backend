import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { I18nLang } from 'nestjs-i18n';
import { AdminAuthGuard } from '@/common/guards/admin-auth-guard/admin-auth.guard';
import { ResponseService } from '@/common/modules/response/response.service';
import { AdminReviewsService } from './admin-reviews.service';
import { AdminReviewQueryDto } from './dto/admin-review-query.dto';
import { ReviewIdParamDto } from './dto/review-id-param.dto';

@ApiTags('⭐ Admin Reviews')
@Controller({ path: 'admin/reviews', version: '1' })
@UseGuards(AdminAuthGuard)
export class AdminReviewsController {
  constructor(
    private readonly adminReviewsService: AdminReviewsService,
    private readonly responseService: ResponseService,
  ) {}

  @ApiOperation({ summary: 'List reviews for moderation' })
  @Get()
  async listReviews(
    @Query() query: AdminReviewQueryDto,
    @I18nLang() lang: string,
  ) {
    const result = await this.adminReviewsService.listReviews(query, lang);
    return this.responseService.paginated({
      message: 'Reviews retrieved successfully',
      data: result.data,
      meta: result.meta,
    });
  }

  @ApiOperation({ summary: 'Get review details' })
  @Get(':reviewId')
  async getReview(
    @Param() params: ReviewIdParamDto,
    @I18nLang() lang: string,
  ) {
    const data = await this.adminReviewsService.getReview(
      params.reviewId,
      lang,
    );
    return this.responseService.success({
      message: 'Review retrieved successfully',
      data,
    });
  }

  @ApiOperation({ summary: 'Approve a review' })
  @Patch(':reviewId/approve')
  async approveReview(@Param() params: ReviewIdParamDto) {
    const data = await this.adminReviewsService.approveReview(params.reviewId);
    return this.responseService.success({
      message: 'Review approved successfully',
      data,
    });
  }

  @ApiOperation({ summary: 'Reject a review' })
  @Patch(':reviewId/reject')
  async rejectReview(@Param() params: ReviewIdParamDto) {
    const data = await this.adminReviewsService.rejectReview(params.reviewId);
    return this.responseService.success({
      message: 'Review rejected successfully',
      data,
    });
  }
}
