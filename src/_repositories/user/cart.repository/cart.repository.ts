import { eq, and, count } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import {
  cartsTable,
  cartItemsTable,
  TCart,
  TCartItem,
  TNewCart,
  TNewCartItem,
} from '@/_db/drizzle/schema';
import { Injectable } from '@nestjs/common';
import { DrizzleTx } from '@/_db/drizzle/types';

@Injectable()
export class CartRepository {
  constructor(private readonly db: DrizzleService) {}

  async getCartByUserId(userId: string): Promise<TCart | undefined> {
    const [cart] = await this.db.client
      .select()
      .from(cartsTable)
      .where(eq(cartsTable.userId, userId))
      .execute();
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
                      columns: { locale: true, name: true, shortDescription: true },
                    },
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

  async getCartItem(cartId: string, variantId: string): Promise<TCartItem | undefined> {
    const [item] = await this.db.client
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

  async getCartItemsByCartId(cartId: string): Promise<TCartItem[]> {
    return await this.db.client
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

  async createCartItem(payload: TNewCartItem, tx?: DrizzleTx): Promise<TCartItem> {
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
}
