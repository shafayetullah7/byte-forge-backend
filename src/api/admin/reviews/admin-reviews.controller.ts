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
import { AdminReviewsService } from './admin-reviews.service';
import { AdminReviewQueryDto } from './dto/admin-review-query.dto';
import { ReviewIdParamDto } from './dto/review-id-param.dto';
import { AuthenticAdminUser } from '@/common/decorators/authentic-admin.decorator';
import { AuthenticAdmin } from '@/common/types';
import { RemoveReviewDto } from './dto/remove-review.dto';
import { ReviewReportIdParamDto } from './dto/review-report-id-param.dto';
import { UpdateReviewReportStatusDto } from './dto/update-review-report-status.dto';

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

  @ApiOperation({ summary: 'Feature a review for landing pages' })
  @Patch(':reviewId/feature')
  async featureReview(
    @Param() params: ReviewIdParamDto,
    @AuthenticAdminUser() admin: AuthenticAdmin,
  ) {
    const data = await this.adminReviewsService.featureReview(
      params.reviewId,
      admin.admin.id,
    );
    return this.responseService.success({
      message: 'Review featured successfully',
      data,
    });
  }

  @ApiOperation({ summary: 'Unfeature a review' })
  @Patch(':reviewId/unfeature')
  async unfeatureReview(@Param() params: ReviewIdParamDto) {
    const data = await this.adminReviewsService.unfeatureReview(params.reviewId);
    return this.responseService.success({
      message: 'Review unfeatured successfully',
      data,
    });
  }

  @ApiOperation({ summary: 'Remove a review from public visibility' })
  @Patch(':reviewId/remove')
  async removeReview(
    @Param() params: ReviewIdParamDto,
    @Body() body: RemoveReviewDto,
    @AuthenticAdminUser() admin: AuthenticAdmin,
  ) {
    const data = await this.adminReviewsService.removeReview(
      params.reviewId,
      admin.admin.id,
      body.reason,
    );
    return this.responseService.success({
      message: 'Review removed successfully',
      data,
    });
  }

  @ApiOperation({ summary: 'Restore a previously removed review' })
  @Patch(':reviewId/restore')
  async restoreReview(@Param() params: ReviewIdParamDto) {
    const data = await this.adminReviewsService.restoreReview(params.reviewId);
    return this.responseService.success({
      message: 'Review restored successfully',
      data,
    });
  }

  @ApiOperation({ summary: 'Update review report status' })
  @Patch('reports/:reportId/status')
  async updateReportStatus(
    @Param() params: ReviewReportIdParamDto,
    @Body() body: UpdateReviewReportStatusDto,
    @AuthenticAdminUser() admin: AuthenticAdmin,
  ) {
    const data = await this.adminReviewsService.updateReportStatus(
      params.reportId,
      body.status,
      admin.admin.id,
    );
    return this.responseService.success({
      message: 'Review report status updated successfully',
      data,
    });
  }
}
