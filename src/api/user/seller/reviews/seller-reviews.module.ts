import { Module } from '@nestjs/common';
import { ReviewRepositoryModule } from '@/_repositories/review/review.repository/review.repository.module';
import { ShopRepositoryModule } from '@/_repositories/business/shop.repository/shop.repository.module';
import { SellerReviewsController } from './seller-reviews.controller';
import { SellerReviewsService } from './seller-reviews.service';

@Module({
  imports: [ReviewRepositoryModule, ShopRepositoryModule],
  controllers: [SellerReviewsController],
  providers: [SellerReviewsService],
})
export class SellerReviewsModule {}
