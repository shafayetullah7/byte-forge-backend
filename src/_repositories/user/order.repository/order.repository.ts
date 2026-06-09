import { eq, inArray, count, desc, and, or, like, sql, SQL } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import {
  ordersTable,
  orderItemsTable,
  orderAddressTable,
  orderStatusHistoryTable,
  orderGroupsTable,
  TOrder,
  TNewOrder,
  TOrderItem,
  TNewOrderItem,
  TOrderAddress,
  TNewOrderAddress,
  TOrderStatusHistory,
  TNewOrderStatusHistory,
  TOrderGroup,
  TNewOrderGroup,
} from '@/_db/drizzle/schema';
import { TOrderStatus, TPaymentStatus } from '@/_db/drizzle/enum';
import { Injectable } from '@nestjs/common';
import { TLockTransaction } from '@/_repositories/_types/lock.transaction';

export interface BuyerOrderStats {
  total: number;
  active: number;
  delivered: number;
  cancelled: number;
  totalSpent: string;
}

export interface GetBuyerOrderGroupsParams {
  userId: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  orderStatus?: TOrderStatus;
  paymentStatus?: TPaymentStatus;
  search?: string;
  lang?: string;
}

@Injectable()
export class OrderRepository {
  constructor(private readonly db: DrizzleService) {}

  async createOrder(
    data: TNewOrder,
    transaction?: TLockTransaction,
  ): Promise<TOrder> {
    const executor = this.db.getExecutor(transaction?.tx);
    const [order] = await executor
      .insert(ordersTable)
      .values(data)
      .returning()
      .execute();
    return order;
  }

  async getOrderById(id: string): Promise<TOrder | undefined> {
    const [order] = await this.db.client
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, id))
      .execute();
    return order;
  }

  async getOrderByIdAndUserId(
    id: string,
    userId: string,
    transaction?: TLockTransaction,
  ): Promise<TOrder | undefined> {
    const executor = this.db.getExecutor(transaction?.tx);
    const baseQuery = executor
      .select()
      .from(ordersTable)
      .where(and(eq(ordersTable.id, id), eq(ordersTable.userId, userId)));

    const lockQuery = transaction?.lock ? baseQuery.for('update') : baseQuery;
    const [order] = await lockQuery.execute();
    return order;
  }

  async updateOrder(
    id: string,
    data: Partial<TOrder>,
    transaction?: TLockTransaction,
  ): Promise<TOrder> {
    const executor = this.db.getExecutor(transaction?.tx);
    const [order] = await executor
      .update(ordersTable)
      .set(data)
      .where(eq(ordersTable.id, id))
      .returning()
      .execute();
    return order;
  }

  async getOrdersByGroupId(groupId: string): Promise<TOrder[]> {
    return await this.db.client
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.groupId, groupId))
      .orderBy(ordersTable.createdAt)
      .execute();
  }

  async createOrderItem(
    data: TNewOrderItem,
    transaction?: TLockTransaction,
  ): Promise<TOrderItem> {
    const executor = this.db.getExecutor(transaction?.tx);
    const [item] = await executor
      .insert(orderItemsTable)
      .values(data)
      .returning()
      .execute();
    return item;
  }

  async createOrderItems(
    items: TNewOrderItem[],
    transaction?: TLockTransaction,
  ): Promise<TOrderItem[]> {
    const executor = this.db.getExecutor(transaction?.tx);
    const result = await executor
      .insert(orderItemsTable)
      .values(items)
      .returning()
      .execute();
    return result;
  }

  async createOrderAddress(
    data: TNewOrderAddress,
    transaction?: TLockTransaction,
  ): Promise<TOrderAddress> {
    const executor = this.db.getExecutor(transaction?.tx);
    const [address] = await executor
      .insert(orderAddressTable)
      .values(data)
      .returning()
      .execute();
    return address;
  }

  async createOrderStatusHistory(
    data: TNewOrderStatusHistory,
    transaction?: TLockTransaction,
  ): Promise<TOrderStatusHistory> {
    const executor = this.db.getExecutor(transaction?.tx);
    const [history] = await executor
      .insert(orderStatusHistoryTable)
      .values(data)
      .returning()
      .execute();
    return history;
  }

  async createOrderGroup(
    data: TNewOrderGroup,
    transaction?: TLockTransaction,
  ): Promise<TOrderGroup> {
    const executor = this.db.getExecutor(transaction?.tx);
    const [group] = await executor
      .insert(orderGroupsTable)
      .values(data)
      .returning()
      .execute();
    return group;
  }

  async getOrderGroupWithOrders(
    groupId: string,
  ): Promise<(TOrderGroup & { orders: TOrder[] }) | undefined> {
    const [group] = await this.db.client.query.orderGroupsTable.findMany({
      where: eq(orderGroupsTable.id, groupId),
      with: {
        orders: true,
      },
    });
    return group;
  }

  async getOrdersWithItemsByGroupId(groupId: string): Promise<TOrder[]> {
    const orders = await this.db.client.query.ordersTable.findMany({
      where: eq(ordersTable.groupId, groupId),
      with: {
        items: true,
        address: true,
        statusHistory: {
          orderBy: orderStatusHistoryTable.createdAt,
        },
      },
    });
    return orders;
  }

  async getBuyerOrderStats(userId: string): Promise<BuyerOrderStats> {
    const allGroups = await this.db.client.query.orderGroupsTable.findMany({
      where: eq(orderGroupsTable.userId, userId),
      with: {
        orders: true,
      },
    });

    const activeStatuses = [
      'PENDING_PAYMENT',
      'CONFIRMED',
      'PROCESSING',
      'SHIPPED',
    ];

    return {
      total: allGroups.length,
      active: allGroups.filter((g) =>
        g.orders.some((o) => activeStatuses.includes(o.status)),
      ).length,
      delivered: allGroups.filter((g) =>
        g.orders.some((o) => o.status === 'DELIVERED'),
      ).length,
      cancelled: allGroups.filter((g) =>
        g.orders.some((o) => o.status === 'CANCELLED'),
      ).length,
      totalSpent: allGroups
        .filter((g) => g.orders.some((o) => o.status === 'DELIVERED'))
        .reduce((sum, g) => sum + parseFloat(g.totalAmount), 0)
        .toFixed(0),
    };
  }

  async getBuyerOrderGroupsPaginated(
    params: GetBuyerOrderGroupsParams,
  ): Promise<{
    groups: (TOrderGroup & {
      orders: (TOrder & {
        items: TOrderItem[];
        address: TOrderAddress | undefined;
        statusHistory: TOrderStatusHistory[];
      })[];
    })[];
    total: number;
  }> {
    const {
      userId,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      orderStatus,
      paymentStatus,
      search,
      lang = 'en',
    } = params;

    const offset = (page - 1) * limit;

    // Build base where for user
    const userWhere = eq(orderGroupsTable.userId, userId);

    // If filtering by order status or payment status, we need to find groupIds that match
    let filteredGroupIds: string[] | undefined;

    if (orderStatus || paymentStatus || search) {
      const orderConditions: SQL[] = [eq(ordersTable.userId, userId)];

      if (orderStatus) {
        orderConditions.push(eq(ordersTable.status, orderStatus));
      }

      if (paymentStatus) {
        orderConditions.push(eq(ordersTable.paymentStatus, paymentStatus));
      }

      if (search) {
        const searchLower = `%${search.toLowerCase()}%`;
        orderConditions.push(
          or(
            like(ordersTable.orderNumber, searchLower),
            sql`EXISTS (
              SELECT 1 FROM shop_translations st
              JOIN shops s ON st.shop_id = s.id
              WHERE s.id = ${ordersTable.shopId}
              AND st.locale = ${lang}
              AND LOWER(st.name) LIKE ${searchLower}
            )`,
            sql`EXISTS (
              SELECT 1 FROM ${orderItemsTable} oi
              WHERE oi.order_id = ${ordersTable.id}
              AND LOWER(oi.product_name) LIKE ${searchLower}
            )`,
          )!,
        );
      }

      const matchingOrders = await this.db.client
        .select({ groupId: ordersTable.groupId })
        .from(ordersTable)
        .where(and(...orderConditions))
        .execute();

      filteredGroupIds = matchingOrders
        .map((o) => o.groupId)
        .filter((id): id is string => id !== null);

      if (filteredGroupIds.length === 0) {
        return { groups: [], total: 0 };
      }
    }

    // Build group where
    const groupWhere = filteredGroupIds
      ? and(userWhere, inArray(orderGroupsTable.id, filteredGroupIds))
      : userWhere;

    // Count total matching groups
    const totalResult = await this.db.client
      .select({ count: count() })
      .from(orderGroupsTable)
      .where(groupWhere)
      .execute();

    // Order by
    const orderByField =
      sortBy === 'createdAt'
        ? orderGroupsTable.createdAt
        : orderGroupsTable.totalAmount;

    // Fetch groups with orders
    const groups = await this.db.client.query.orderGroupsTable.findMany({
      where: groupWhere,
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
      ...(sortOrder === 'desc' ? { orderBy: desc(orderByField) } : {}),
      limit,
      offset,
    });

    return {
      groups,
      total: totalResult[0]?.count ?? 0,
    };
  }
}
