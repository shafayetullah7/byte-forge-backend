import { Module } from '@nestjs/common';
import { ReviewRepositoryModule } from '@/_repositories/review/review.repository/review.repository.module';
import { AdminReviewsController } from './admin-reviews.controller';
import { AdminReviewsService } from './admin-reviews.service';

@Module({
  imports: [ReviewRepositoryModule],
  controllers: [AdminReviewsController],
  providers: [AdminReviewsService],
})
export class AdminReviewsModule {}
