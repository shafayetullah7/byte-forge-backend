export const ShopVerificationActionEnum = {
  SUBMITTED: 'SUBMITTED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SUSPENDED: 'SUSPENDED',
  DEACTIVATED: 'DEACTIVATED',
  REACTIVATED: 'REACTIVATED',
} as const;

export type ShopVerificationActionType =
  (typeof ShopVerificationActionEnum)[keyof typeof ShopVerificationActionEnum];
