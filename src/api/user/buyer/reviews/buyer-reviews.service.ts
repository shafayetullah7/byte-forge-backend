import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReviewRepository } from '@/_repositories/review/review.repository/review.repository';
import { CreateReviewDto } from './dto/create-review.dto';
import { ListBuyerReviewsQueryDto } from './dto/list-buyer-reviews-query.dto';
import { resolveTranslation } from '@/common/utils/resolve-translation.util';
import type { TProductTranslation } from '@/_db/drizzle/schema';

@Injectable()
export class BuyerReviewsService {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  async getEligibility(userId: string, orderItemId: string) {
    return this.reviewRepository.getBuyerEligibility(userId, orderItemId);
  }

  async createReview(userId: string, dto: CreateReviewDto) {
    const result = await this.reviewRepository.createVerifiedPurchaseReview({
      userId,
      orderItemId: dto.orderItemId,
      rating: dto.rating,
      title: dto.title,
      comment: dto.comment,
    });

    if (result.kind === 'NOT_FOUND') {
      throw new NotFoundException('Order item not found');
    }

    if (result.kind === 'NOT_REVIEWABLE') {
      throw new BadRequestException(
        'This order item is not eligible for review yet',
      );
    }

    if (result.kind === 'ALREADY_REVIEWED') {
      throw new ConflictException('This order item has already been reviewed');
    }

    return result.review;
  }

  async listReviews(
    userId: string,
    query: ListBuyerReviewsQueryDto,
    lang: string,
  ) {
    const result = await this.reviewRepository.listBuyerReviews(userId, query);

    return {
      data: result.data.map((review: any) => ({
        id: review.id,
        orderItemId: review.orderItemId,
        productId: review.productId,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        isVerifiedPurchase: review.isVerifiedPurchase,
        status: review.status,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        product: review.product
          ? {
              id: review.product.id,
              slug: review.product.slug,
              name:
                resolveTranslation<TProductTranslation>(
                  review.product.translations,
                  lang,
                )?.name ??
                'Product',
              thumbnail: review.product.thumbnail
                ? {
                    id: review.product.thumbnail.id,
                    url: review.product.thumbnail.url,
                  }
                : null,
            }
          : null,
        images: (review.images ?? []).map((image: any) => ({
          id: image.id,
          displayOrder: image.displayOrder,
          media: image.media
            ? { id: image.media.id, url: image.media.url }
            : null,
        })),
      })),
      meta: result.meta,
    };
  }
}
