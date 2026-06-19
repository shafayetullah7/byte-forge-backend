import { Module } from '@nestjs/common';
import { BuyerReviewsController } from './buyer-reviews.controller';
import { BuyerReviewsService } from './buyer-reviews.service';
import { ReviewRepositoryModule } from '@/_repositories/review/review.repository/review.repository.module';

@Module({
  imports: [ReviewRepositoryModule],
  controllers: [BuyerReviewsController],
  providers: [BuyerReviewsService],
})
export class BuyerReviewsModule {}
