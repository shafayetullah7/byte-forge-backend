import type { TPaymentMethodRow } from '@/_db/drizzle/schema/payment/payment-methods.schema';
import type { TMedia } from '@/_db/drizzle/schema/media/media.schema';
import type { TPaymentMethod } from '@/_db/drizzle/enum/payment-method.enum';

type PaymentMethodCatalog = TPaymentMethodRow & {
  logo?: TMedia | null;
};

export function mapOrderPaymentMethod(
  paymentMethod: TPaymentMethod | null,
  paymentMethodId: string | null,
  catalog?: PaymentMethodCatalog | null,
) {
  return {
    paymentMethod,
    paymentMethodId,
    paymentMethodKey: catalog?.key ?? paymentMethod,
    paymentMethodDisplayName: catalog?.displayName ?? null,
    paymentMethodLogoUrl: catalog?.logo?.url ?? null,
  };
}
