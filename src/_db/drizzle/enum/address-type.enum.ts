export const AddressTypeEnum = {
  SHIPPING: 'shipping',
  BILLING: 'billing',
  BOTH: 'both',
} as const;

export type TAddressType = (typeof AddressTypeEnum)[keyof typeof AddressTypeEnum];
