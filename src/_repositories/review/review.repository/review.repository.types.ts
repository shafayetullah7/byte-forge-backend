import type {
  TAdmin,
  TMedia,
  TOrder,
  TOrderItem,
  TProduct,
  TProductTranslation,
  TReview,
  TReviewImage,
  TReviewReport,
  TShop,
  TShopTranslation,
  TUser,
} from '@/_db/drizzle/schema';

export type ReviewPaginationMeta = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type ReviewPaginatedResult<T> = {
  data: T[];
  meta: ReviewPaginationMeta;
};

export type ReviewImageWithMedia = TReviewImage & {
  media: TMedia | null;
};

export type ReviewUserSummary = Pick<
  TUser,
  'id' | 'firstName' | 'lastName' | 'userName'
>;

export type ProductWithThumbAndTranslations = TProduct & {
  thumbnail: TMedia | null;
  translations: TProductTranslation[];
};

export type ProductWithShop = ProductWithThumbAndTranslations & {
  shop:
    | (TShop & {
        translations: TShopTranslation[];
      })
    | null;
};

export type ReviewReportWithSeller = TReviewReport & {
  reportedBySeller: ReviewUserSummary | null;
  resolvedByAdmin: TAdmin | null;
};

export type ReviewWithBuyerRelations = TReview & {
  product: ProductWithThumbAndTranslations | null;
  images: ReviewImageWithMedia[];
};

export type ReviewWithSellerRelations = TReview & {
  user: ReviewUserSummary | null;
  product: ProductWithThumbAndTranslations | null;
  orderItem:
    | (TOrderItem & {
        order: TOrder;
      })
    | null;
  images: ReviewImageWithMedia[];
  reports: TReviewReport[];
};

export type ReviewWithPublicRelations = ReviewWithSellerRelations;

export type ReviewWithFeaturedRelations = TReview & {
  user: ReviewUserSummary | null;
  product: ProductWithThumbAndTranslations | null;
};

export type ReviewWithAdminRelations = TReview & {
  user: ReviewUserSummary | null;
  product: ProductWithShop | null;
  orderItem:
    | (TOrderItem & {
        order: TOrder;
      })
    | null;
  images: ReviewImageWithMedia[];
  reports: ReviewReportWithSeller[];
};
