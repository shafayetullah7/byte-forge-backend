import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DrizzleService } from '../../_db/drizzle/drizzle.service';
import { cartItemTable } from '../../_db/drizzle/schema/cart';
import { plantVariantTable, plantTable } from '../../_db/drizzle/schema/plant';
import { shopTable } from '../../_db/drizzle/schema/shop';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { eq, and, or, desc } from 'drizzle-orm';

@Injectable()
export class CartService {
  constructor(private readonly db: DrizzleService) {}

  async getCart(userId: string | null, sessionId?: string) {
    if (!userId && !sessionId) {
      throw new BadRequestException('User ID or Session ID is required');
    }

    // For simplicity, prioritize userId over sessionId
    const whereClause = userId
      ? eq(cartItemTable.userId, userId)
      : eq(cartItemTable.sessionId, sessionId!);

    const items = await this.db.client
      .select({
        id: cartItemTable.id,
        quantity: cartItemTable.quantity,
        createdAt: cartItemTable.createdAt,
        updatedAt: cartItemTable.updatedAt,
        plantVariant: plantVariantTable,
        plant: plantTable,
        shop: shopTable,
      })
      .from(cartItemTable)
      .leftJoin(
        plantVariantTable,
        eq(plantVariantTable.id, cartItemTable.plantVariantId),
      )
      .leftJoin(plantTable, eq(plantTable.id, plantVariantTable.plantId))
      .leftJoin(shopTable, eq(shopTable.id, plantTable.shopId))
      .where(whereClause)
      .orderBy(desc(cartItemTable.createdAt));

    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

    return {
      items,
      totalItems,
    };
  }

  async addToCart(
    userId: string | null,
    sessionId: string | null,
    dto: AddToCartDto,
  ) {
    if (!userId && !sessionId) {
      throw new BadRequestException('User ID or Session ID is required');
    }

    // Verify plant variant exists and is active
    const [variant] = await this.db.client
      .select()
      .from(plantVariantTable)
      .leftJoin(plantTable, eq(plantTable.id, plantVariantTable.plantId))
      .where(eq(plantVariantTable.id, dto.plantVariantId))
      .limit(1);

    if (!variant || variant.plants?.status !== 'active') {
      throw new NotFoundException('Plant variant not found or inactive');
    }

    // Check if item already exists in cart
    const conditions = [eq(cartItemTable.plantVariantId, dto.plantVariantId)];
    if (userId) {
      conditions.push(eq(cartItemTable.userId, userId));
    }
    if (sessionId) {
      conditions.push(eq(cartItemTable.sessionId, sessionId));
    }

    const [existingItem] = await this.db.client
      .select()
      .from(cartItemTable)
      .where(and(...conditions))
      .limit(1);

    if (existingItem) {
      // Update quantity
      await this.db.client
        .update(cartItemTable)
        .set({
          quantity: existingItem.quantity + dto.quantity,
        })
        .where(eq(cartItemTable.id, existingItem.id));

      return this.getCart(userId, sessionId || undefined);
    }

    // Add new item
    await this.db.client.insert(cartItemTable).values({
      userId: userId || null,
      sessionId: sessionId || null,
      plantVariantId: dto.plantVariantId,
      quantity: dto.quantity,
    });

    return this.getCart(userId, sessionId || undefined);
  }

  async updateCartItem(
    userId: string | null,
    sessionId: string | null,
    itemId: string,
    dto: UpdateCartItemDto,
  ) {
    if (!userId && !sessionId) {
      throw new BadRequestException('User ID or Session ID is required');
    }

    const conditions = [eq(cartItemTable.id, itemId)];
    if (userId) {
      conditions.push(eq(cartItemTable.userId, userId));
    }
    if (sessionId) {
      conditions.push(eq(cartItemTable.sessionId, sessionId));
    }

    const [updated] = await this.db.client
      .update(cartItemTable)
      .set({ quantity: dto.quantity })
      .where(and(...conditions))
      .returning();

    if (!updated) {
      throw new NotFoundException('Cart item not found');
    }

    return this.getCart(userId, sessionId || undefined);
  }

  async removeCartItem(
    userId: string | null,
    sessionId: string | null,
    itemId: string,
  ) {
    if (!userId && !sessionId) {
      throw new BadRequestException('User ID or Session ID is required');
    }

    const conditions = [eq(cartItemTable.id, itemId)];
    if (userId) {
      conditions.push(eq(cartItemTable.userId, userId));
    }
    if (sessionId) {
      conditions.push(eq(cartItemTable.sessionId, sessionId));
    }

    const [deleted] = await this.db.client
      .delete(cartItemTable)
      .where(and(...conditions))
      .returning();

    if (!deleted) {
      throw new NotFoundException('Cart item not found');
    }

    return this.getCart(userId, sessionId || undefined);
  }

  async clearCart(userId: string | null, sessionId: string | null) {
    if (!userId && !sessionId) {
      throw new BadRequestException('User ID or Session ID is required');
    }

    // For simplicity, prioritize userId over sessionId
    const whereClause = userId
      ? eq(cartItemTable.userId, userId)
      : eq(cartItemTable.sessionId, sessionId!);

    await this.db.client.delete(cartItemTable).where(whereClause);

    return { items: [], totalItems: 0 };
  }
}
