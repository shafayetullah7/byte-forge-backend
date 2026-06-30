import { Module } from '@nestjs/common';
import { ShopArticleRepository } from './shop-article.repository';

@Module({
  providers: [ShopArticleRepository],
  exports: [ShopArticleRepository],
})
export class ShopArticleRepositoryModule {}
