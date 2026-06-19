import { BadRequestException, Injectable } from '@nestjs/common';
import { InventoryRepository } from '@/_repositories/business/inventory.repository/inventory.repository';
import { InventoryMovementTypeEnum } from '@/_db/drizzle/enum/inventory-movement-type.enum';
import { DrizzleTx } from '@/_db/drizzle/types';

export interface OrderInventoryItem {
  variantId: string;
  shopId: string;
  quantity: number;
  productName?: string;
}

@Injectable()
export class OrderInventoryService {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async reserveForOrder(
    items: OrderInventoryItem[],
    orderId: string,
    userId: string,
    tx: DrizzleTx,
  ): Promise<void> {
    for (const item of items) {
      const inventory = await this.inventoryRepository.getOrCreateInventory(
        item.variantId,
        item.shopId,
        tx,
      );

      if (!inventory.trackInventory) {
        continue;
      }

      const available = inventory.quantity - inventory.reservedQuantity;
      if (!inventory.allowBackorder && available < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${item.productName ?? 'item'}. Available: ${available}, Requested: ${item.quantity}`,
        );
      }

      const previousQuantity = inventory.quantity;
      const previousReserved = inventory.reservedQuantity;
      const newReserved = previousReserved + item.quantity;

      await this.inventoryRepository.update(
        inventory.id,
        { reservedQuantity: newReserved },
        tx,
      );

      await this.inventoryRepository.createMovement(
        {
          inventoryId: inventory.id,
          shopId: item.shopId,
          movementType: InventoryMovementTypeEnum.ORDER_RESERVED,
          quantityChange: 0,
          previousQuantity,
          newQuantity: previousQuantity,
          previousReserved,
          newReserved,
          referenceType: 'order',
          referenceId: orderId,
          createdBy: userId,
        },
        tx,
      );
    }
  }

  async releaseOrderReservation(
    items: OrderInventoryItem[],
    orderId: string,
    userId: string,
    tx: DrizzleTx,
  ): Promise<void> {
    for (const item of items) {
      const inventory = await this.inventoryRepository.findByVariantId(
        item.variantId,
      );

      if (!inventory?.trackInventory) {
        continue;
      }

      const previousQuantity = inventory.quantity;
      const previousReserved = inventory.reservedQuantity;
      const newReserved = Math.max(0, previousReserved - item.quantity);

      await this.inventoryRepository.update(
        inventory.id,
        { reservedQuantity: newReserved },
        tx,
      );

      await this.inventoryRepository.createMovement(
        {
          inventoryId: inventory.id,
          shopId: item.shopId,
          movementType: InventoryMovementTypeEnum.ORDER_CANCELLED,
          quantityChange: 0,
          previousQuantity,
          newQuantity: previousQuantity,
          previousReserved,
          newReserved,
          referenceType: 'order',
          referenceId: orderId,
          reason: 'Order cancelled',
          createdBy: userId,
        },
        tx,
      );
    }
  }

  async fulfillOrder(
    items: OrderInventoryItem[],
    orderId: string,
    userId: string,
    tx: DrizzleTx,
  ): Promise<void> {
    for (const item of items) {
      const inventory = await this.inventoryRepository.getOrCreateInventory(
        item.variantId,
        item.shopId,
        tx,
      );

      if (!inventory.trackInventory) {
        continue;
      }

      const previousQuantity = inventory.quantity;
      const previousReserved = inventory.reservedQuantity;
      const newQuantity = Math.max(0, previousQuantity - item.quantity);
      const newReserved = Math.max(0, previousReserved - item.quantity);

      await this.inventoryRepository.update(
        inventory.id,
        {
          quantity: newQuantity,
          reservedQuantity: newReserved,
        },
        tx,
      );

      await this.inventoryRepository.createMovement(
        {
          inventoryId: inventory.id,
          shopId: item.shopId,
          movementType: InventoryMovementTypeEnum.ORDER_FULFILLED,
          quantityChange: -item.quantity,
          previousQuantity,
          newQuantity,
          previousReserved,
          newReserved,
          referenceType: 'order',
          referenceId: orderId,
          reason: 'Order shipped',
          createdBy: userId,
        },
        tx,
      );
    }
  }
}
