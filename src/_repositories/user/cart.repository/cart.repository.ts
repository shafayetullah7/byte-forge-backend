import { eq, and, count, inArray } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import {
  cartsTable,
  cartItemsTable,
  inventoryTable,
  TCart,
  TCartItem,
  TNewCart,
  TNewCartItem,
  TInventory,
} from '@/_db/drizzle/schema';
import { Injectable } from '@nestjs/common';
import { DrizzleTx } from '@/_db/drizzle/types';
import { TLockTransaction } from '@/_repositories/_types/lock.transaction';

@Injectable()
export class CartRepository {
  constructor(private readonly db: DrizzleService) {}

  async getCartByUserId(
    userId: string,
    transaction?: TLockTransaction,
  ): Promise<TCart | undefined> {
    const executor = this.db.getExecutor(transaction?.tx);
    let baseQuery = executor
      .select()
      .from(cartsTable)
      .where(eq(cartsTable.userId, userId));

    const lockQuery = transaction?.lock ? baseQuery.for('update') : baseQuery;
    const [cart] = await lockQuery.execute();
    return cart;
  }

  async getCartById(
    cartId: string,
    transaction?: TLockTransaction,
  ): Promise<TCart | undefined> {
    const executor = this.db.getExecutor(transaction?.tx);
    const baseQuery = executor
      .select()
      .from(cartsTable)
      .where(eq(cartsTable.id, cartId));

    const lockQuery = transaction?.lock ? baseQuery.for('update') : baseQuery;
    const [cart] = await lockQuery.execute();
    return cart;
  }

  async getCartByGuestToken(
    guestToken: string,
    transaction?: TLockTransaction,
  ): Promise<TCart | undefined> {
    const executor = this.db.getExecutor(transaction?.tx);
    const baseQuery = executor
      .select()
      .from(cartsTable)
      .where(eq(cartsTable.guestToken, guestToken));
    const lockQuery = transaction?.lock ? baseQuery.for('update') : baseQuery;
    const [cart] = await lockQuery.execute();
    return cart;
  }

  async getCartWithItems(userId: string) {
    return await this.db.client.query.cartsTable.findFirst({
      where: eq(cartsTable.userId, userId),
      with: {
        items: {
          with: {
            variant: {
              with: {
                product: {
                  columns: {
                    id: true,
                    slug: true,
                    productType: true,
                    status: true,
                    shopId: true,
                    thumbnailId: true,
                  },
                  with: {
                    thumbnail: {
                      columns: { id: true, url: true },
                    },
                    translations: {
                      columns: {
                        locale: true,
                        name: true,
                        shortDescription: true,
                      },
                    },
                  },
                },
                plantAttributes: {
                  columns: {
                    growthStage: true,
                    plantForm: true,
                    variegation: true,
                    leafDensity: true,
                    containerType: true,
                    containerSize: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async createCart(payload: TNewCart, tx?: DrizzleTx): Promise<TCart> {
    const executor = this.db.getExecutor(tx);
    const [cart] = await executor
      .insert(cartsTable)
      .values(payload)
      .returning()
      .execute();
    return cart;
  }

  async getCartItem(
    cartId: string,
    variantId: string,
    tx?: DrizzleTx,
  ): Promise<TCartItem | undefined> {
    const executor = this.db.getExecutor(tx);
    const [item] = await executor
      .select()
      .from(cartItemsTable)
      .where(
        and(
          eq(cartItemsTable.cartId, cartId),
          eq(cartItemsTable.variantId, variantId),
        ),
      )
      .execute();
    return item;
  }

  async getCartItemById(cartItemId: string): Promise<TCartItem | undefined> {
    const [item] = await this.db.client
      .select()
      .from(cartItemsTable)
      .where(eq(cartItemsTable.id, cartItemId))
      .execute();
    return item;
  }

  async getCartItemsByCartId(
    cartId: string,
    tx?: DrizzleTx,
  ): Promise<TCartItem[]> {
    const executor = this.db.getExecutor(tx);
    return await executor
      .select()
      .from(cartItemsTable)
      .where(eq(cartItemsTable.cartId, cartId))
      .execute();
  }

  async getCartItemsCount(cartId: string): Promise<number> {
    const [{ total }] = await this.db.client
      .select({ total: count() })
      .from(cartItemsTable)
      .where(eq(cartItemsTable.cartId, cartId))
      .execute();
    return Number(total);
  }

  async createCartItem(
    payload: TNewCartItem,
    tx?: DrizzleTx,
  ): Promise<TCartItem> {
    const executor = this.db.getExecutor(tx);
    const [item] = await executor
      .insert(cartItemsTable)
      .values(payload)
      .returning()
      .execute();
    return item;
  }

  async updateCartItem(
    cartItemId: string,
    data: Partial<Pick<TNewCartItem, 'quantity'>>,
    tx?: DrizzleTx,
  ): Promise<TCartItem> {
    const executor = this.db.getExecutor(tx);
    const [item] = await executor
      .update(cartItemsTable)
      .set(data)
      .where(eq(cartItemsTable.id, cartItemId))
      .returning()
      .execute();
    return item;
  }

  async deleteCartItem(cartItemId: string, tx?: DrizzleTx): Promise<void> {
    const executor = this.db.getExecutor(tx);
    await executor
      .delete(cartItemsTable)
      .where(eq(cartItemsTable.id, cartItemId))
      .execute();
  }

  async deleteAllCartItems(cartId: string, tx?: DrizzleTx): Promise<void> {
    const executor = this.db.getExecutor(tx);
    await executor
      .delete(cartItemsTable)
      .where(eq(cartItemsTable.cartId, cartId))
      .execute();
  }

  async deleteCartItemsByIds(itemIds: string[], tx?: DrizzleTx): Promise<void> {
    if (itemIds.length === 0) return;
    const executor = this.db.getExecutor(tx);
    await executor
      .delete(cartItemsTable)
      .where(inArray(cartItemsTable.id, itemIds))
      .execute();
  }

  async getInventoryByVariantIds(variantIds: string[]): Promise<TInventory[]> {
    if (variantIds.length === 0) return [];
    return await this.db.client
      .select()
      .from(inventoryTable)
      .where(inArray(inventoryTable.variantId, variantIds))
      .execute();
  }

  async getInventoryByVariantId(
    variantId: string,
  ): Promise<TInventory | undefined> {
    const [inventory] = await this.db.client
      .select()
      .from(inventoryTable)
      .where(eq(inventoryTable.variantId, variantId))
      .execute();
    return inventory;
  }

  async updateCart(
    cartId: string,
    data: Partial<Pick<TNewCart, 'userId' | 'guestToken'>>,
    tx?: DrizzleTx,
  ): Promise<TCart> {
    const executor = this.db.getExecutor(tx);
    const [cart] = await executor
      .update(cartsTable)
      .set(data)
      .where(eq(cartsTable.id, cartId))
      .returning()
      .execute();
    return cart;
  }

  async getCartWithItemsByGuestToken(guestToken: string) {
    return await this.db.client.query.cartsTable.findFirst({
      where: eq(cartsTable.guestToken, guestToken),
      with: {
        items: {
          with: {
            variant: {
              with: {
                product: {
                  columns: {
                    id: true,
                    slug: true,
                    productType: true,
                    status: true,
                    shopId: true,
                    thumbnailId: true,
                  },
                  with: {
                    thumbnail: {
                      columns: { id: true, url: true },
                    },
                    translations: {
                      columns: {
                        locale: true,
                        name: true,
                        shortDescription: true,
                      },
                    },
                  },
                },
                plantAttributes: {
                  columns: {
                    growthStage: true,
                    plantForm: true,
                    variegation: true,
                    leafDensity: true,
                    containerType: true,
                    containerSize: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async getCartWithItemsById(cartId: string) {
    return await this.db.client.query.cartsTable.findFirst({
      where: eq(cartsTable.id, cartId),
      with: {
        items: {
          with: {
            variant: {
              with: {
                product: {
                  columns: {
                    id: true,
                    slug: true,
                    productType: true,
                    status: true,
                    shopId: true,
                    thumbnailId: true,
                  },
                  with: {
                    thumbnail: {
                      columns: { id: true, url: true },
                    },
                    translations: {
                      columns: {
                        locale: true,
                        name: true,
                        shortDescription: true,
                      },
                    },
                  },
                },
                plantAttributes: {
                  columns: {
                    growthStage: true,
                    plantForm: true,
                    variegation: true,
                    leafDensity: true,
                    containerType: true,
                    containerSize: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}
