import { eq, inArray } from 'drizzle-orm';
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
import { Injectable } from '@nestjs/common';
import { TLockTransaction } from '@/_repositories/_types/lock.transaction';

@Injectable()
export class OrderRepository {
  constructor(private readonly db: DrizzleService) {}

  async createOrder(data: TNewOrder, transaction?: TLockTransaction): Promise<TOrder> {
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

  async getOrdersByGroupId(groupId: string): Promise<TOrder[]> {
    return await this.db.client
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.groupId, groupId))
      .orderBy(ordersTable.createdAt)
      .execute();
  }

  async createOrderItem(data: TNewOrderItem, transaction?: TLockTransaction): Promise<TOrderItem> {
    const executor = this.db.getExecutor(transaction?.tx);
    const [item] = await executor
      .insert(orderItemsTable)
      .values(data)
      .returning()
      .execute();
    return item;
  }

  async createOrderItems(items: TNewOrderItem[], transaction?: TLockTransaction): Promise<TOrderItem[]> {
    const executor = this.db.getExecutor(transaction?.tx);
    const result = await executor
      .insert(orderItemsTable)
      .values(items)
      .returning()
      .execute();
    return result;
  }

  async createOrderAddress(data: TNewOrderAddress, transaction?: TLockTransaction): Promise<TOrderAddress> {
    const executor = this.db.getExecutor(transaction?.tx);
    const [address] = await executor
      .insert(orderAddressTable)
      .values(data)
      .returning()
      .execute();
    return address;
  }

  async createOrderStatusHistory(data: TNewOrderStatusHistory, transaction?: TLockTransaction): Promise<TOrderStatusHistory> {
    const executor = this.db.getExecutor(transaction?.tx);
    const [history] = await executor
      .insert(orderStatusHistoryTable)
      .values(data)
      .returning()
      .execute();
    return history;
  }

  async createOrderGroup(data: TNewOrderGroup, transaction?: TLockTransaction): Promise<TOrderGroup> {
    const executor = this.db.getExecutor(transaction?.tx);
    const [group] = await executor
      .insert(orderGroupsTable)
      .values(data)
      .returning()
      .execute();
    return group;
  }

  async getOrderGroupWithOrders(groupId: string): Promise<TOrderGroup & { orders: TOrder[] } | undefined> {
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
}
