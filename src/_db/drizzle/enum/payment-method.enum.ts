export const PaymentMethodEnum = {
  COD: 'COD',
  CARD: 'CARD',
  BKASH: 'BKASH',
  NAGAD: 'NAGAD',
  SSLCOMMERCE: 'SSLCOMMERCE',
} as const;

export type TPaymentMethod =
  (typeof PaymentMethodEnum)[keyof typeof PaymentMethodEnum];
