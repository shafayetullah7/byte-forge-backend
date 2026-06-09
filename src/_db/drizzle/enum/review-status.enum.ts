export const ReviewStatusEnum = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type TReviewStatus =
  (typeof ReviewStatusEnum)[keyof typeof ReviewStatusEnum];
