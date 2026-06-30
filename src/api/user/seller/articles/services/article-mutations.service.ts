import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ShopArticleRepository,
  type ArticleTranslationInput,
} from '@/_repositories/business/shop-article.repository/shop-article.repository';
import { ShopContentModerationStatusEnum } from '@/_db/drizzle/enum';
import { CreateArticleDto } from '../dto/create-article.dto';
import { UpdateArticleDto } from '../dto/update-article.dto';
import {
  assertDeletableStatus,
  assertEditableStatus,
  mapSellerArticle,
} from '../articles.mapper';

@Injectable()
export class CreateArticleService {
  constructor(private readonly articleRepository: ShopArticleRepository) {}

  async execute(shopId: string, dto: CreateArticleDto) {
    const slug =
      dto.slug ??
      (await this.articleRepository.generateUniqueSlug(
        shopId,
        dto.translations.en.title,
      ));

    if (dto.slug) {
      const taken = await this.articleRepository.slugExists(shopId, dto.slug);
      if (taken) throw new ConflictException('Slug already exists');
    }

    const translations = {
      en: dto.translations.en,
      bn: dto.translations.bn ?? {
        title: dto.translations.en.title,
        excerpt: dto.translations.en.excerpt ?? null,
        body: dto.translations.en.body ?? null,
      },
    };

    const article = await this.articleRepository.createArticle(
      {
        shopId,
        slug,
        coverImageId: dto.coverImageId ?? null,
        category: dto.category ?? null,
        readMinutes: dto.readMinutes ?? null,
        moderationStatus: ShopContentModerationStatusEnum.DRAFT,
      },
      translations,
    );

    if (!article) throw new NotFoundException('Article not found');
    return mapSellerArticle(article);
  }
}

@Injectable()
export class UpdateArticleService {
  constructor(private readonly articleRepository: ShopArticleRepository) {}

  async execute(shopId: string, articleId: string, dto: UpdateArticleDto) {
    const existing = await this.articleRepository.findByIdForShop(
      shopId,
      articleId,
    );
    if (!existing) throw new NotFoundException('Article not found');
    if (!assertEditableStatus(existing.moderationStatus)) {
      throw new BadRequestException(
        'Article cannot be edited in current status',
      );
    }

    if (dto.slug && dto.slug !== existing.slug) {
      const taken = await this.articleRepository.slugExists(
        shopId,
        dto.slug,
        articleId,
      );
      if (taken) throw new ConflictException('Slug already exists');
    }

    const article = await this.articleRepository.updateArticle(
      shopId,
      articleId,
      {
        slug: dto.slug,
        coverImageId: dto.coverImageId,
        category: dto.category,
        readMinutes: dto.readMinutes,
      },
      dto.translations as ArticleTranslationInput | undefined,
    );

    if (!article) throw new NotFoundException('Article not found');
    return mapSellerArticle(article);
  }
}

@Injectable()
export class SubmitArticleService {
  constructor(private readonly articleRepository: ShopArticleRepository) {}

  async execute(shopId: string, articleId: string, shopStatus: string) {
    if (shopStatus !== 'ACTIVE') {
      throw new BadRequestException('Shop must be active to submit articles');
    }

    const existing = await this.articleRepository.findByIdForShop(
      shopId,
      articleId,
    );
    if (!existing) throw new NotFoundException('Article not found');

    if (!assertEditableStatus(existing.moderationStatus)) {
      throw new BadRequestException('Article cannot be submitted');
    }

    const en = existing.translations.find((t) => t.locale === 'en');
    const bn = existing.translations.find((t) => t.locale === 'bn');
    if (
      !en?.title?.trim() ||
      !en?.excerpt?.trim() ||
      !en?.body?.trim() ||
      !bn?.title?.trim() ||
      !bn?.excerpt?.trim() ||
      !bn?.body?.trim()
    ) {
      throw new BadRequestException(
        'English and Bengali title, excerpt, and body are required to submit',
      );
    }

    const updated = await this.articleRepository.updateModerationStatus(
      articleId,
      ShopContentModerationStatusEnum.PENDING,
      { rejectedReason: null },
    );

    const article = await this.articleRepository.findByIdForShop(
      shopId,
      updated!.id,
    );
    return mapSellerArticle(article!);
  }
}

@Injectable()
export class ArchiveArticleService {
  constructor(private readonly articleRepository: ShopArticleRepository) {}

  async execute(shopId: string, articleId: string) {
    const existing = await this.articleRepository.findByIdForShop(
      shopId,
      articleId,
    );
    if (!existing) throw new NotFoundException('Article not found');

    await this.articleRepository.updateModerationStatus(
      articleId,
      ShopContentModerationStatusEnum.ARCHIVED,
    );

    const article = await this.articleRepository.findByIdForShop(
      shopId,
      articleId,
    );
    return mapSellerArticle(article!);
  }
}

@Injectable()
export class DeleteArticleService {
  constructor(private readonly articleRepository: ShopArticleRepository) {}

  async execute(shopId: string, articleId: string) {
    const existing = await this.articleRepository.findByIdForShop(
      shopId,
      articleId,
    );
    if (!existing) throw new NotFoundException('Article not found');
    if (!assertDeletableStatus(existing.moderationStatus)) {
      throw new BadRequestException('Approved articles cannot be deleted');
    }

    await this.articleRepository.deleteArticle(shopId, articleId);
    return { id: articleId };
  }
}
