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
import { TShopTranslation, TProductTranslation, TMedia } from '@/_db/drizzle/schema';
import { resolveTranslation } from '@/common/utils/resolve-translation.util';

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
    logo: TMedia | null;
    translations: TShopTranslation[];
  } | null;
}

interface OrderGroupWithRelations extends TOrderGroup {
  orders: OrderWithRelations[];
}

// ─── Service ─────────────────────────────────────────────────────────────────

@Injectable()
export class GetOrderGroupService {
  constructor(private readonly db: DrizzleService) {}

  async execute(
    userId: string,
    groupId: string,
    lang: string = 'en',
  ) {
    const group = await this.fetchGroupWithDetails(groupId, userId, lang);

    if (!group) {
      throw new NotFoundException('Order group not found');
    }

    return this.mapGroupResponse(group, lang);
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
            },
            shop: {
              with: {
                translations: {
                  where: (t) => eq(t.locale, lang),
                },
                logo: true,
              },
            },
          },
        },
      },
    });

    return group ?? null;
  }

  private mapGroupResponse(group: OrderGroupWithRelations, lang: string) {
    return {
      id: group.id,
      totalAmount: group.totalAmount,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      orders: group.orders.map((order) => this.mapOrderResponse(order, lang)),
    };
  }

  private mapOrderResponse(order: OrderWithRelations, lang: string) {
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
      paymentMethod: order.paymentMethod,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      tax: order.tax,
      total: order.total,
      notes: order.notes,
      cancelledAt: order.cancelledAt,
      cancelledReason: order.cancelledReason,
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
      statusHistory: order.statusHistory.map((history) => ({
        id: history.id,
        fromStatus: history.fromStatus,
        toStatus: history.toStatus,
        notes: history.notes,
        createdAt: history.createdAt,
      })),
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
