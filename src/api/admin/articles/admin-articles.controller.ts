import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminAuthGuard } from '@/common/guards/admin-auth-guard/admin-auth.guard';
import { ResponseService } from '@/common/modules/response/response.service';
import { AuthenticAdminUser } from '@/common/decorators/authentic-admin.decorator';
import { AuthenticAdmin } from '@/common/types';
import { AdminArticlesService } from './admin-articles.service';
import {
  AdminArticlesQueryDto,
  ArticleIdParamDto,
} from './dto/admin-articles-query.dto';
import { RejectArticleDto } from './dto/reject-article.dto';
import { EditorsPickDto } from './dto/editors-pick.dto';

@ApiTags('📰 Admin Articles')
@Controller({ path: 'admin/articles', version: '1' })
@UseGuards(AdminAuthGuard)
export class AdminArticlesController {
  constructor(
    private readonly adminArticlesService: AdminArticlesService,
    private readonly responseService: ResponseService,
  ) {}

  @ApiOperation({ summary: 'List articles for moderation' })
  @Get()
  async listArticles(@Query() query: AdminArticlesQueryDto) {
    const result = await this.adminArticlesService.listArticles(query);
    return this.responseService.paginated({
      message: 'Articles retrieved successfully',
      data: result.data,
      meta: result.meta,
    });
  }

  @ApiOperation({ summary: 'Get article details' })
  @Get(':id')
  async getArticle(@Param() params: ArticleIdParamDto) {
    const data = await this.adminArticlesService.getArticle(params.id);
    return this.responseService.success({
      message: 'Article retrieved successfully',
      data,
    });
  }

  @ApiOperation({ summary: 'Approve a pending article' })
  @Post(':id/approve')
  async approveArticle(
    @Param() params: ArticleIdParamDto,
    @AuthenticAdminUser() admin: AuthenticAdmin,
  ) {
    const data = await this.adminArticlesService.approveArticle(
      params.id,
      admin.admin.id,
    );
    return this.responseService.success({
      message: 'Article approved successfully',
      data,
    });
  }

  @ApiOperation({ summary: 'Reject a pending article' })
  @Post(':id/reject')
  async rejectArticle(
    @Param() params: ArticleIdParamDto,
    @Body() dto: RejectArticleDto,
    @AuthenticAdminUser() admin: AuthenticAdmin,
  ) {
    const data = await this.adminArticlesService.rejectArticle(
      params.id,
      admin.admin.id,
      dto,
    );
    return this.responseService.success({
      message: 'Article rejected successfully',
      data,
    });
  }

  @ApiOperation({ summary: "Set or clear an article as editor's pick" })
  @Patch(':id/editors-pick')
  async setEditorsPick(
    @Param() params: ArticleIdParamDto,
    @Body() dto: EditorsPickDto,
    @AuthenticAdminUser() admin: AuthenticAdmin,
  ) {
    const data = await this.adminArticlesService.setEditorsPick(
      params.id,
      admin.admin.id,
      dto.isEditorsPick,
    );
    return this.responseService.success({
      message: dto.isEditorsPick
        ? "Article marked as editor's pick"
        : "Article removed from editor's pick",
      data,
    });
  }
}
