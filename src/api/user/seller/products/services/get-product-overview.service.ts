import { Injectable, Logger } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { productsTable } from '@/_db/drizzle/schema';

export type ProductOverviewResult = {
  id: string;
  status: string;
  createdAt: Date;
  thumbnail: { id: string; url: string } | null;
  variants: Array<{
    id: string;
    sku: string | null;
    price: string;
    inventoryCount: number;
    lowStockThreshold: number;
    isBase: boolean;
    isActive: boolean;
  }>;
  stockBreakdown: {
    totalStock: number;
    availableStock: number;
    reservedStock: number;
    lowStockCount: number;
  };
};

type DrizzleOverview = NonNullable<
  Awaited<ReturnType<GetProductOverviewService['queryProduct']>>
>;

@Injectable()
export class GetProductOverviewService {
  private readonly logger = new Logger(GetProductOverviewService.name);

  constructor(private readonly db: DrizzleService) {}

  private queryProduct(shopId: string, productId: string) {
    return this.db.client.query.productsTable.findFirst({
      where: and(eq(productsTable.shopId, shopId), eq(productsTable.id, productId)),
      columns: {
        id: true,
        status: true,
        createdAt: true,
      },
      with: {
        thumbnail: {
          columns: { id: true, url: true },
        },
        variants: {
          columns: {
            id: true,
            sku: true,
            price: true,
            inventoryCount: true,
            lowStockThreshold: true,
            isBase: true,
            isActive: true,
          },
        },
      },
    });
  }

  async execute(shopId: string, productId: string): Promise<ProductOverviewResult | null> {
    try {
      const product = await this.queryProduct(shopId, productId);
      if (!product) return null;
      return this.mapResult(product);
    } catch (error) {
      this.logger.error(
        `Failed to fetch product overview ${productId} for shop ${shopId}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  private mapResult(product: DrizzleOverview): ProductOverviewResult {
    const thumbnail = product.thumbnail
      ? { id: product.thumbnail.id, url: product.thumbnail.url }
      : null;

    const variants = product.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      price: v.price,
      inventoryCount: v.inventoryCount ?? 0,
      lowStockThreshold: v.lowStockThreshold ?? 5,
      isBase: v.isBase,
      isActive: v.isActive,
    }));

    const totalStock = variants.reduce((sum, v) => sum + v.inventoryCount, 0);
    const lowStockCount = variants.filter(
      (v) => v.inventoryCount > 0 && v.inventoryCount <= v.lowStockThreshold,
    ).length;

    return {
      id: product.id,
      status: product.status,
      createdAt: product.createdAt,
      thumbnail,
      variants,
      stockBreakdown: {
        totalStock,
        availableStock: totalStock,
        reservedStock: 0,
        lowStockCount,
      },
    };
  }
}
