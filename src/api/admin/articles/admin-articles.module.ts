import { Module } from '@nestjs/common';
import { AdminAuthGuardModule } from '@/common/guards/admin-auth-guard/admin-auth-guard.module';
import { ShopArticleRepositoryModule } from '@/_repositories/business/shop-article.repository/shop-article.repository.module';
import { AdminArticlesController } from './admin-articles.controller';
import { AdminArticlesService } from './admin-articles.service';

@Module({
  imports: [AdminAuthGuardModule, ShopArticleRepositoryModule],
  controllers: [AdminArticlesController],
  providers: [AdminArticlesService],
})
export class AdminArticlesModule {}
