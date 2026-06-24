import { Module } from '@nestjs/common';
import { PublicShopController } from './controllers/public-shop.controller';
import { PublicShopService } from './services/public-shop.service';
import { ListPublicShopsService } from './services/list-public-shops.service';
import { ListPublicShopProductsService } from './services/list-public-shop-products.service';
import { PublicShopReviewsService } from './services/public-shop-reviews.service';
import { GetShopCategoriesServedService } from './services/get-shop-categories-served.service';
import { ShopRepository } from '@/_repositories/business/shop.repository/shop.repository';
import { ShopStorefrontRepositoryModule } from '@/_repositories/business/shop-storefront.repository/shop-storefront.repository.module';
import { ReviewRepository } from '@/_repositories/review/review.repository/review.repository';

@Module({
  imports: [ShopStorefrontRepositoryModule],
  controllers: [PublicShopController],
  providers: [
    PublicShopService,
    ListPublicShopsService,
    ListPublicShopProductsService,
    PublicShopReviewsService,
    GetShopCategoriesServedService,
    ShopRepository,
    ReviewRepository,
  ],
})
export class PublicShopsModule {}
