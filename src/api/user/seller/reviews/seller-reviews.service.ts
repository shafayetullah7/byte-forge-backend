import { Injectable, NotFoundException } from '@nestjs/common';
import { ReviewRepository } from '@/_repositories/review/review.repository/review.repository';
import { ShopRepository } from '@/_repositories/business/shop.repository/shop.repository';
import { SellerReviewQueryDto } from './dto/seller-review-query.dto';

@Injectable()
export class SellerReviewsService {
  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly shopRepository: ShopRepository,
  ) {}

  async getProductReviews(
    userId: string,
    productId: string,
    query: SellerReviewQueryDto,
  ) {
    const shop = await this.resolveShop(userId);
    await this.assertProductOwnership(shop.id, productId);

    const [summary, reviews] = await Promise.all([
      this.reviewRepository.getProductReviewSummary(productId, false),
      this.reviewRepository.listProductReviews(productId, query),
    ]);

    return {
      summary,
      reviews: reviews.data.map((review: any) => ({
        id: review.id,
        productId: review.productId,
        orderItemId: review.orderItemId,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        isVerifiedPurchase: review.isVerifiedPurchase,
        status: review.status,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        customerName: review.user
          ? `${review.user.firstName} ${review.user.lastName}`.trim()
          : 'Buyer',
        images: (review.images ?? []).map((image: any) => ({
          id: image.id,
          displayOrder: image.displayOrder,
          media: image.media
            ? { id: image.media.id, url: image.media.url }
            : null,
        })),
      })),
      meta: reviews.meta,
    };
  }

  private async resolveShop(userId: string) {
    const shop = await this.shopRepository.getShopByOwnerId(userId);
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }
    return shop;
  }

  private async assertProductOwnership(shopId: string, productId: string) {
    const ownsProduct = await this.reviewRepository.assertSellerOwnsProduct(
      shopId,
      productId,
    );

    if (!ownsProduct) {
      throw new NotFoundException('Product not found');
    }
  }
}
