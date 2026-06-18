import { Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import {
  orderGroupsTable,
  orderStatusHistoryTable,
  TOrderGroup,
  TOrder,
  TOrderItem,
  TOrderAddress,
  TOrderStatusHistory,
} from '@/_db/drizzle/schema';
import { and, eq } from 'drizzle-orm';
import {
  TShopTranslation,
  TProductTranslation,
  TMedia,
} from '@/_db/drizzle/schema';
import { resolveTranslation } from '@/common/utils/resolve-translation.util';
import { mapOrderPaymentMethod } from '@/common/utils/map-order-payment-method.util';
import { mapStatusHistoryActor } from '@/api/user/seller/orders/map-status-history-actor.util';
import type { TPaymentMethodRow } from '@/_db/drizzle/schema/payment/payment-methods.schema';

// ─── Query Result Types ──────────────────────────────────────────────────────

interface OrderItemWithProduct extends TOrderItem {
  product: {
    id: string;
    thumbnail: TMedia | null;
    translations: TProductTranslation[];
  } | null;
}

interface OrderWithRelations extends TOrder {
  items: OrderItemWithProduct[];
  address: TOrderAddress | null;
  statusHistory: TOrderStatusHistory[];
  shop: {
    id: string;
    ownerId: string;
    logo: TMedia | null;
    translations: TShopTranslation[];
  } | null;
  paymentMethodCatalog:
    | (TPaymentMethodRow & {
        logo: TMedia | null;
      })
    | null;
  shipment: {
    id: string;
    trackingNumber: string | null;
    carrier: string | null;
    shippingMethod: string | null;
    status: string;
    shippedAt: Date | null;
    deliveredAt: Date | null;
    estimatedDelivery: Date | null;
  } | null;
}

interface OrderGroupWithRelations extends TOrderGroup {
  orders: OrderWithRelations[];
}

// ─── Service ─────────────────────────────────────────────────────────────────

@Injectable()
export class GetOrderGroupService {
  constructor(private readonly db: DrizzleService) {}

  async execute(userId: string, groupId: string, lang: string = 'en') {
    const group = await this.fetchGroupWithDetails(groupId, userId, lang);

    if (!group) {
      throw new NotFoundException('Order group not found');
    }

    return this.mapGroupResponse(group, lang, userId);
  }

  private async fetchGroupWithDetails(
    groupId: string,
    userId: string,
    lang: string,
  ): Promise<OrderGroupWithRelations | null> {
    const [group] = await this.db.client.query.orderGroupsTable.findMany({
      where: and(
        eq(orderGroupsTable.id, groupId),
        eq(orderGroupsTable.userId, userId),
      ),
      with: {
        orders: {
          with: {
            items: {
              with: {
                product: {
                  with: {
                    thumbnail: true,
                    translations: {
                      where: (t) => eq(t.locale, lang),
                    },
                  },
                },
              },
            },
            address: true,
            statusHistory: {
              orderBy: orderStatusHistoryTable.createdAt,
              with: {
                changedByUser: true,
              },
            },
            shop: {
              with: {
                translations: {
                  where: (t) => eq(t.locale, lang),
                },
                logo: true,
              },
            },
            paymentMethodCatalog: {
              with: {
                logo: true,
              },
            },
            shipment: true,
          },
        },
      },
    });

    return group ?? null;
  }

  private mapGroupResponse(
    group: OrderGroupWithRelations,
    lang: string,
    userId: string,
  ) {
    return {
      id: group.id,
      totalAmount: group.totalAmount,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      orders: group.orders.map((order) =>
        this.mapOrderResponse(order, lang, userId),
      ),
    };
  }

  private mapOrderResponse(
    order: OrderWithRelations,
    lang: string,
    userId: string,
  ) {
    const shopTranslation = resolveTranslation<TShopTranslation>(
      order.shop?.translations,
      lang,
    );
    const shopName = shopTranslation?.name ?? 'Unknown Shop';
    const shopLogo = order.shop?.logo?.url ?? null;

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      shopId: order.shopId,
      shopName,
      shopLogo,
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
      buyerDeliveryConfirmedAt: order.buyerDeliveryConfirmedAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      address: order.address
        ? {
            id: order.address.id,
            recipientName: order.address.recipientName,
            phone: order.address.phone,
            addressLine1: order.address.addressLine1,
            addressLine2: order.address.addressLine2,
            city: order.address.city,
            state: order.address.state,
            postalCode: order.address.postalCode,
            country: order.address.country,
            companyName: order.address.companyName,
            deliveryInstructions: order.address.deliveryInstructions,
          }
        : null,
      items: order.items.map((item) => this.mapItemResponse(item, lang)),
      statusHistory: order.statusHistory.map((history) => {
        const { actor, actorLabel } = mapStatusHistoryActor(
          history,
          userId,
          order.shop?.ownerId ?? null,
          shopName,
        );
        return {
          id: history.id,
          fromStatus: history.fromStatus,
          toStatus: history.toStatus,
          notes: history.notes,
          createdAt: history.createdAt,
          actor,
          actorLabel,
        };
      }),
      shipment: order.shipment
        ? {
            id: order.shipment.id,
            trackingNumber: order.shipment.trackingNumber,
            carrier: order.shipment.carrier,
            shippingMethod: order.shipment.shippingMethod,
            status: order.shipment.status,
            shippedAt: order.shipment.shippedAt,
            deliveredAt: order.shipment.deliveredAt,
            estimatedDelivery: order.shipment.estimatedDelivery,
          }
        : null,
    };
  }

  private mapItemResponse(item: OrderItemWithProduct, lang: string) {
    const productTranslation = resolveTranslation<TProductTranslation>(
      item.product?.translations,
      lang,
    );
    return {
      id: item.id,
      productName: productTranslation?.name ?? item.productName,
      variantTitle: item.variantTitle,
      sku: item.sku,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      subtotal: item.subtotal,
      thumbnail: item.product?.thumbnail
        ? { id: item.product.thumbnail.id, url: item.product.thumbnail.url }
        : null,
    };
  }
}
