import { Injectable, Logger } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import {
  inventoryTable,
  productVariantsTable,
  productsTable,
} from '@/_db/drizzle/schema';
import { VariantInventoryDto } from '../dto/inventory-response.dto';

type DrizzleInventoryRow = {
  inventory: typeof inventoryTable.$inferSelect;
  product_variants: typeof productVariantsTable.$inferSelect;
  products: typeof productsTable.$inferSelect;
};

@Injectable()
export class GetProductInventoryService {
  private readonly logger = new Logger(GetProductInventoryService.name);

  constructor(private readonly db: DrizzleService) {}

  async execute(shopId: string, productId: string) {
    try {
      const rows = await this.db.client
        .select()
        .from(inventoryTable)
        .innerJoin(
          productVariantsTable,
          eq(inventoryTable.variantId, productVariantsTable.id),
        )
        .innerJoin(
          productsTable,
          eq(productVariantsTable.productId, productsTable.id),
        )
        .where(
          and(
            eq(productsTable.shopId, shopId),
            eq(productsTable.id, productId),
          ),
        )
        .execute();

      if (rows.length === 0) {
        return null;
      }

      const product = rows[0].products;
      const variants = rows.map((row) => this.mapVariant(row));

      const totalStock = variants.reduce((sum, v) => sum + v.quantity, 0);
      const reservedStock = variants.reduce((sum, v) => sum + v.reservedQuantity, 0);
      const availableStock = totalStock - reservedStock;
      const lowStockCount = variants.filter(
        (v) => v.availableQuantity > 0 && v.availableQuantity <= v.lowStockThreshold,
      ).length;
      const outOfStockCount = variants.filter(
        (v) => v.availableQuantity === 0,
      ).length;

      return {
        productId: product.id,
        productName: product.id, // Name comes from translations, not stored on product
        productSlug: product.slug,
        totalStock,
        reservedStock,
        availableStock,
        lowStockCount,
        outOfStockCount,
        variants,
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch inventory for product ${productId} in shop ${shopId}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  private mapVariant(row: DrizzleInventoryRow): VariantInventoryDto {
    const { inventory, product_variants: variant } = row;
    const availableQuantity = inventory.quantity - inventory.reservedQuantity;

    let status: 'in_stock' | 'low_stock' | 'out_of_stock';
    if (availableQuantity === 0) {
      status = 'out_of_stock';
    } else if (availableQuantity <= inventory.lowStockThreshold) {
      status = 'low_stock';
    } else {
      status = 'in_stock';
    }

    return {
      inventoryId: inventory.id,
      variantId: variant.id,
      sku: variant.sku,
      variantName: null, // Variant name comes from translations, not stored
      price: variant.price,
      quantity: inventory.quantity,
      reservedQuantity: inventory.reservedQuantity,
      availableQuantity,
      lowStockThreshold: inventory.lowStockThreshold,
      trackInventory: inventory.trackInventory,
      allowBackorder: inventory.allowBackorder,
      status,
      lastStockUpdate: inventory.updatedAt,
    };
  }
}
