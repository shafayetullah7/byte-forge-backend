import { Module } from '@nestjs/common';
import { ReviewRepositoryModule } from '@/_repositories/review/review.repository/review.repository.module';
import { PublicReviewsController } from './public-reviews.controller';
import { PublicReviewsService } from './public-reviews.service';

@Module({
  imports: [ReviewRepositoryModule],
  controllers: [PublicReviewsController],
  providers: [PublicReviewsService],
})
export class PublicReviewsModule {}
