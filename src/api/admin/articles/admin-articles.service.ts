import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ShopArticleRepository } from '@/_repositories/business/shop-article.repository/shop-article.repository';
import { ShopContentModerationStatusEnum } from '@/_db/drizzle/enum';
import { AdminArticlesQueryDto } from './dto/admin-articles-query.dto';
import { RejectArticleDto } from './dto/reject-article.dto';

type ShopWithTranslations = {
  id: string;
  slug: string;
  translations?: Array<{ locale: string; name: string }>;
};

type ArticleAdminRow = {
  id: string;
  shopId: string;
  slug: string;
  category: string | null;
  readMinutes: number | null;
  isEditorsPick: boolean;
  editorsPickAt: Date | null;
  moderationStatus: string;
  rejectedReason: string | null;
  moderatedAt: Date | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  translations: Array<{
    locale: string;
    title: string;
    excerpt: string | null;
    body: string | null;
  }>;
  coverImage?: { id: string; url: string } | null;
  shop?: ShopWithTranslations | null;
};

@Injectable()
export class AdminArticlesService {
  constructor(private readonly articleRepository: ShopArticleRepository) {}

  async listArticles(query: AdminArticlesQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const result = await this.articleRepository.listAdmin({
      page,
      limit,
      search: query.search,
      moderationStatus: query.moderationStatus,
    });

    return {
      data: result.data.map((article) =>
        this.mapArticleListItem(article as ArticleAdminRow),
      ),
      meta: result.meta,
    };
  }

  async getArticle(articleId: string) {
    const article = await this.articleRepository.findByIdForAdmin(articleId);
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    return this.mapArticleDetail(article);
  }

  async approveArticle(articleId: string, adminId: string) {
    const article = await this.articleRepository.findByIdForAdmin(articleId);
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    if (article.moderationStatus !== ShopContentModerationStatusEnum.PENDING) {
      throw new BadRequestException('Only pending articles can be approved');
    }

    const updated = await this.articleRepository.updateModerationStatus(
      articleId,
      ShopContentModerationStatusEnum.APPROVED,
      {
        rejectedReason: null,
        moderatedByAdminId: adminId,
        moderatedAt: new Date(),
        publishedAt: article.publishedAt ?? new Date(),
      },
    );

    if (!updated) {
      throw new NotFoundException('Article not found');
    }

    return this.getArticle(articleId);
  }

  async rejectArticle(
    articleId: string,
    adminId: string,
    dto: RejectArticleDto,
  ) {
    const article = await this.articleRepository.findByIdForAdmin(articleId);
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    if (article.moderationStatus !== ShopContentModerationStatusEnum.PENDING) {
      throw new BadRequestException('Only pending articles can be rejected');
    }

    const updated = await this.articleRepository.updateModerationStatus(
      articleId,
      ShopContentModerationStatusEnum.REJECTED,
      {
        rejectedReason: dto.reason,
        moderatedByAdminId: adminId,
        moderatedAt: new Date(),
      },
    );

    if (!updated) {
      throw new NotFoundException('Article not found');
    }

    return this.getArticle(articleId);
  }

  async setEditorsPick(
    articleId: string,
    adminId: string,
    isEditorsPick: boolean,
  ) {
    const article = await this.articleRepository.findByIdForAdmin(articleId);
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    if (
      isEditorsPick &&
      article.moderationStatus !== ShopContentModerationStatusEnum.APPROVED
    ) {
      throw new BadRequestException(
        "Only approved articles can be marked as editor's pick",
      );
    }

    const updated = await this.articleRepository.setEditorsPick(
      articleId,
      isEditorsPick,
      isEditorsPick ? adminId : null,
    );

    if (!updated) {
      throw new NotFoundException('Article not found');
    }

    return this.getArticle(articleId);
  }

  private mapArticleListItem(article: ArticleAdminRow) {
    const en = article.translations.find((t) => t.locale === 'en');
    return {
      id: article.id,
      slug: article.slug,
      title: en?.title ?? '',
      category: article.category,
      moderationStatus: article.moderationStatus,
      publishedAt: article.publishedAt?.toISOString() ?? null,
      isEditorsPick: article.isEditorsPick,
      shop: this.mapShopSummary(article.shop),
      createdAt: article.createdAt.toISOString(),
    };
  }

  private mapArticleDetail(article: ArticleAdminRow) {
    const en = article.translations.find((t) => t.locale === 'en');
    const bn = article.translations.find((t) => t.locale === 'bn');

    return {
      id: article.id,
      shopId: article.shopId,
      slug: article.slug,
      category: article.category,
      readMinutes: article.readMinutes,
      coverImage: article.coverImage
        ? { id: article.coverImage.id, url: article.coverImage.url }
        : null,
      moderationStatus: article.moderationStatus,
      rejectedReason: article.rejectedReason,
      moderatedAt: article.moderatedAt?.toISOString() ?? null,
      publishedAt: article.publishedAt?.toISOString() ?? null,
      isEditorsPick: article.isEditorsPick,
      editorsPickAt: article.editorsPickAt?.toISOString() ?? null,
      title: en?.title ?? '',
      translations: {
        en: {
          title: en?.title ?? '',
          excerpt: en?.excerpt ?? null,
          body: en?.body ?? null,
        },
        bn: {
          title: bn?.title ?? '',
          excerpt: bn?.excerpt ?? null,
          body: bn?.body ?? null,
        },
      },
      shop: this.mapShopSummary(article.shop),
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
    };
  }

  private mapShopSummary(shop?: ShopWithTranslations | null) {
    if (!shop) return null;
    const en = shop.translations?.find((t) => t.locale === 'en');
    return {
      id: shop.id,
      slug: shop.slug,
      name: en?.name ?? shop.slug,
    };
  }
}
