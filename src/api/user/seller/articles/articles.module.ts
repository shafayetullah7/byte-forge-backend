import { Module } from '@nestjs/common';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import {
  ListArticlesService,
  GetArticleService,
} from './services/article-queries.service';
import {
  CreateArticleService,
  UpdateArticleService,
  SubmitArticleService,
  ArchiveArticleService,
  DeleteArticleService,
} from './services/article-mutations.service';
import { ShopArticleRepositoryModule } from '@/_repositories/business/shop-article.repository/shop-article.repository.module';
import { VerifiedUserAuthGuardModule } from '@/common/guards/verified-user-auth-guard/verified-user-auth.guard.module';
import { SellerShopGuardModule } from '@/common/guards/seller-shop-guard/seller-shop.guard.module';

@Module({
  controllers: [ArticlesController],
  providers: [
    ArticlesService,
    ListArticlesService,
    GetArticleService,
    CreateArticleService,
    UpdateArticleService,
    SubmitArticleService,
    ArchiveArticleService,
    DeleteArticleService,
  ],
  imports: [
    ShopArticleRepositoryModule,
    VerifiedUserAuthGuardModule,
    SellerShopGuardModule,
  ],
})
export class ArticlesModule {}
