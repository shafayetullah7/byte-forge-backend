import { eq, and, desc, gte, lte, count, sql } from 'drizzle-orm';
import { InventoryMovementTypeEnum } from '@/_db/drizzle/enum';

import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import {
  inventoryTable,
  inventoryMovementsTable,
  TInventory,
  TNewInventory,
  TInventoryMovement,
  TNewInventoryMovement,
} from '@/_db/drizzle/schema';
import { Injectable } from '@nestjs/common';

export interface MovementFilterParams {
  variantId?: string;
  movementType?: InventoryMovementTypeEnum;
  startDate?: string;
  endDate?: string;
}

export interface PaginatedMovementsResult {
  movements: TInventoryMovement[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class InventoryRepository {
  constructor(private readonly db: DrizzleService) {}

  async findByVariantId(variantId: string): Promise<TInventory | undefined> {
    const [inventory] = await this.db.client
      .select()
      .from(inventoryTable)
      .where(eq(inventoryTable.variantId, variantId))
      .execute();
    return inventory;
  }

  async findByVariantIdForUpdate(variantId: string): Promise<TInventory | undefined> {
    const [inventory] = await this.db.client
      .select()
      .from(inventoryTable)
      .where(eq(inventoryTable.variantId, variantId))
      .for('update')
      .execute();
    return inventory;
  }

  async findByShopId(shopId: string): Promise<TInventory[]> {
    return await this.db.client
      .select()
      .from(inventoryTable)
      .where(eq(inventoryTable.shopId, shopId))
      .execute();
  }

  async createInventory(payload: TNewInventory, tx?: any): Promise<TInventory> {
    const executor = this.db.getExecutor(tx);
    const [created] = await executor
      .insert(inventoryTable)
      .values(payload)
      .returning()
      .execute();
    return created;
  }

  async update(
    inventoryId: string,
    data: Partial<Pick<TNewInventory, 'quantity' | 'reservedQuantity'>>,
    tx?: any,
  ): Promise<TInventory> {
    const executor = this.db.getExecutor(tx);
    const [updated] = await executor
      .update(inventoryTable)
      .set(data)
      .where(eq(inventoryTable.id, inventoryId))
      .returning()
      .execute();
    return updated;
  }

  async createMovement(
    payload: TNewInventoryMovement,
    tx?: any,
  ): Promise<TInventoryMovement> {
    const executor = this.db.getExecutor(tx);
    const [created] = await executor
      .insert(inventoryMovementsTable)
      .values(payload)
      .returning()
      .execute();
    return created;
  }

  async findMovements(
    inventoryId: string,
    filters: MovementFilterParams,
    page: number,
    limit: number,
  ): Promise<PaginatedMovementsResult> {
    const conditions = [eq(inventoryMovementsTable.inventoryId, inventoryId)];

    if (filters.movementType) {
      conditions.push(
        eq(inventoryMovementsTable.movementType, filters.movementType),
      );
    }

    if (filters.startDate) {
      conditions.push(
        gte(
          inventoryMovementsTable.createdAt,
          new Date(filters.startDate),
        ),
      );
    }

    if (filters.endDate) {
      conditions.push(
        lte(
          inventoryMovementsTable.createdAt,
          new Date(filters.endDate),
        ),
      );
    }

    const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

    const [totalResult] = await this.db.client
      .select({ total: count() })
      .from(inventoryMovementsTable)
      .where(whereClause)
      .execute();

    const movements = await this.db.client
      .select()
      .from(inventoryMovementsTable)
      .where(whereClause)
      .orderBy(desc(inventoryMovementsTable.createdAt))
      .limit(limit)
      .offset((page - 1) * limit)
      .execute();

    return {
      movements,
      total: Number(totalResult.total),
      page,
      limit,
    };
  }

  async findMovementsByVariantId(
    variantId: string,
    filters: MovementFilterParams,
    page: number,
    limit: number,
  ): Promise<PaginatedMovementsResult> {
    const inventory = await this.findByVariantId(variantId);
    if (!inventory) {
      return { movements: [], total: 0, page, limit };
    }

    return this.findMovements(inventory.id, filters, page, limit);
  }
}
