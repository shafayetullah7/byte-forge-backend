import { resolveTranslation } from '@/common/utils/resolve-translation.util';
import { mapOrderPaymentMethod } from '@/common/utils/map-order-payment-method.util';
import type { TProductTranslation } from '@/_db/drizzle/schema';

type SellerOrderRecord = Awaited<
  ReturnType<
    import('@/_repositories/user/order.repository/order.repository').OrderRepository['getSellerOrderDetail']
  >
>;

export function mapSellerOrder(order: NonNullable<SellerOrderRecord>, lang: string) {
  const customerName = order.user
    ? `${order.user.firstName} ${order.user.lastName}`.trim()
    : (order.address?.recipientName ?? 'Unknown Customer');
  const customerEmail = order.user?.localAuth?.email ?? null;
  const customerPhone = order.address?.phone ?? '';

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    ...mapOrderPaymentMethod(
      order.paymentMethod,
      order.paymentMethodId,
      order.paymentMethodCatalog,
    ),
    subtotal: order.subtotal,
    shippingCost: order.shippingCost,
    tax: order.tax,
    total: order.total,
    notes: order.notes,
    cancelledAt: order.cancelledAt,
    cancelledReason: order.cancelledReason,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    customerName,
    customerEmail,
    customerPhone,
    address: order.address
      ? {
          recipientName: order.address.recipientName,
          phone: order.address.phone,
          addressLine1: order.address.addressLine1,
          addressLine2: order.address.addressLine2,
          city: order.address.city,
          state: order.address.state,
          postalCode: order.address.postalCode,
          country: order.address.country,
        }
      : null,
    items: order.items.map((item) => {
      const productTranslation = resolveTranslation<TProductTranslation>(
        item.product?.translations,
        lang,
      );
      return {
        id: item.id,
        productId: item.productId,
        productName: productTranslation?.name ?? item.productName,
        variantTitle: item.variantTitle,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
        imageUrl: item.product?.thumbnail?.url ?? null,
      };
    }),
    statusHistory: order.statusHistory.map((history) => ({
      id: history.id,
      fromStatus: history.fromStatus,
      toStatus: history.toStatus,
      notes: history.notes,
      createdAt: history.createdAt,
    })),
    shipment: order.shipment
      ? {
          id: order.shipment.id,
          trackingNumber: order.shipment.trackingNumber,
          carrier: order.shipment.carrier,
          status: order.shipment.status,
          shippedAt: order.shipment.shippedAt,
          deliveredAt: order.shipment.deliveredAt,
          estimatedDelivery: order.shipment.estimatedDelivery,
        }
      : null,
  };
}

export function mapSellerOrderSummary(
  order: NonNullable<SellerOrderRecord>,
  lang: string,
) {
  const mapped = mapSellerOrder(order, lang);
  return {
    id: mapped.id,
    orderNumber: mapped.orderNumber,
    status: mapped.status,
    paymentStatus: mapped.paymentStatus,
    paymentMethodKey: mapped.paymentMethodKey,
    paymentMethodDisplayName: mapped.paymentMethodDisplayName,
    total: mapped.total,
    createdAt: mapped.createdAt,
    customerName: mapped.customerName,
    customerEmail: mapped.customerEmail,
    items: mapped.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      variantTitle: item.variantTitle,
      quantity: item.quantity,
      imageUrl: item.imageUrl,
    })),
  };
}
