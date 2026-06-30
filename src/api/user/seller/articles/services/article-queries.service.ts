import { Injectable, NotFoundException } from '@nestjs/common';
import { ShopArticleRepository } from '@/_repositories/business/shop-article.repository/shop-article.repository';
import { ListArticlesQueryDto } from '../dto/list-articles-query.dto';
import { mapSellerArticle, mapSellerArticleListItem } from '../articles.mapper';

@Injectable()
export class ListArticlesService {
  constructor(private readonly articleRepository: ShopArticleRepository) {}

  async execute(shopId: string, query: ListArticlesQueryDto) {
    const result = await this.articleRepository.listByShopId(shopId, query);
    return {
      data: result.data.map(mapSellerArticleListItem),
      meta: result.meta,
    };
  }
}

@Injectable()
export class GetArticleService {
  constructor(private readonly articleRepository: ShopArticleRepository) {}

  async execute(shopId: string, articleId: string) {
    const article = await this.articleRepository.findByIdForShop(
      shopId,
      articleId,
    );
    if (!article) throw new NotFoundException('Article not found');
    return mapSellerArticle(article);
  }
}
