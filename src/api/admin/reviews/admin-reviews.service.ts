import { Injectable, NotFoundException } from '@nestjs/common';
import { ReviewRepository } from '@/_repositories/review/review.repository/review.repository';
import { ReviewStatusEnum } from '@/_db/drizzle/enum';
import { AdminReviewQueryDto } from './dto/admin-review-query.dto';
import { resolveTranslation } from '@/common/utils/resolve-translation.util';
import type { TProductTranslation, TShopTranslation } from '@/_db/drizzle/schema';

@Injectable()
export class AdminReviewsService {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  async listReviews(query: AdminReviewQueryDto, lang: string) {
    const result = await this.reviewRepository.listAdminReviews(query);
    return {
      data: result.data.map((review: any) => this.mapAdminReview(review, lang)),
      meta: result.meta,
    };
  }

  async getReview(reviewId: string, lang: string) {
    const review = await this.reviewRepository.getReviewById(reviewId);
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return this.mapAdminReview(review, lang);
  }

  async approveReview(reviewId: string) {
    const review = await this.reviewRepository.updateReviewStatus(
      reviewId,
      ReviewStatusEnum.APPROVED,
    );

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async rejectReview(reviewId: string) {
    const review = await this.reviewRepository.updateReviewStatus(
      reviewId,
      ReviewStatusEnum.REJECTED,
    );

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  private mapAdminReview(review: any, lang: string) {
    const productTranslation = review.product
      ? resolveTranslation<TProductTranslation>(review.product.translations, lang)
      : null;
    const shopTranslation = review.product?.shop
      ? resolveTranslation<TShopTranslation>(
          review.product.shop.translations,
          lang,
        )
      : null;

    return {
      id: review.id,
      userId: review.userId,
      orderItemId: review.orderItemId,
      productId: review.productId,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      isVerifiedPurchase: review.isVerifiedPurchase,
      status: review.status,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      customer: review.user
        ? {
            id: review.user.id,
            name: `${review.user.firstName} ${review.user.lastName}`.trim(),
            userName: review.user.userName,
          }
        : null,
      product: review.product
        ? {
            id: review.product.id,
            slug: review.product.slug,
            name: productTranslation?.name ?? 'Product',
            thumbnail: review.product.thumbnail
              ? {
                  id: review.product.thumbnail.id,
                  url: review.product.thumbnail.url,
                }
              : null,
            shop: review.product.shop
              ? {
                  id: review.product.shop.id,
                  slug: review.product.shop.slug,
                  name: shopTranslation?.name ?? 'Shop',
                }
              : null,
          }
        : null,
      order: review.orderItem?.order
        ? {
            id: review.orderItem.order.id,
            orderNumber: review.orderItem.order.orderNumber,
            status: review.orderItem.order.status,
          }
        : null,
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
