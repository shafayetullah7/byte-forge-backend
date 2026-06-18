import { Injectable, NotFoundException } from '@nestjs/common';
import { ReviewRepository } from '@/_repositories/review/review.repository/review.repository';
import { PublicReviewQueryDto } from './dto/public-review-query.dto';

@Injectable()
export class PublicReviewsService {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  async getProductReviews(productId: string, query: PublicReviewQueryDto) {
    const [summary, reviews] = await Promise.all([
      this.reviewRepository.getProductReviewSummary(productId, true),
      this.reviewRepository.listPublicProductReviews(productId, query),
    ]);

    return {
      summary,
      reviews: reviews.data.map((review: any) => this.mapPublicReview(review)),
      meta: reviews.meta,
    };
  }

  async getPlantReviews(slug: string, query: PublicReviewQueryDto) {
    const productId = await this.reviewRepository.getProductIdBySlug(slug);
    if (!productId) {
      throw new NotFoundException('Plant not found');
    }

    return this.getProductReviews(productId, query);
  }

  private mapPublicReview(review: any) {
    const customerName = review.user
      ? `${review.user.firstName} ${review.user.lastName}`.trim()
      : 'Verified buyer';

    return {
      id: review.id,
      productId: review.productId,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      isVerifiedPurchase: review.isVerifiedPurchase,
      createdAt: review.createdAt,
      customerName,
      images: (review.images ?? []).map((image: any) => ({
        id: image.id,
        displayOrder: image.displayOrder,
        media: image.media
          ? { id: image.media.id, url: image.media.url }
          : null,
      })),
    };
  }
}
