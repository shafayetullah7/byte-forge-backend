export const BusinessAccountVerificationStatusEnum = {
  UNVERIFIED: 'UNVERIFIED',
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
} as const;

// TS type
export type TBusinessAccountVerificationStatus =
  (typeof BusinessAccountVerificationStatusEnum)[keyof typeof BusinessAccountVerificationStatusEnum];
