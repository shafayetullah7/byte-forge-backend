import { Injectable, Logger } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { productsTable } from '@/_db/drizzle/schema';

export type ProductDetailResult = {
  id: string;
  slug: string;
  productType: string;
  status: string;
  thumbnail: { id: string; url: string } | null;
  translations: Array<{
    locale: string;
    name: string;
    description: string | null;
    shortDescription: string | null;
  }>;
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
  createdAt: Date;
  updatedAt: Date;
};

type DrizzleProduct = NonNullable<
  Awaited<ReturnType<GetProductByIdService['queryProduct']>>
>;

@Injectable()
export class GetProductByIdService {
  private readonly logger = new Logger(GetProductByIdService.name);

  constructor(private readonly db: DrizzleService) {}

  private queryProduct(shopId: string, productId: string) {
    return this.db.client.query.productsTable.findFirst({
      where: and(
        eq(productsTable.shopId, shopId),
        eq(productsTable.id, productId),
      ),
      with: {
        thumbnail: {
          columns: { id: true, url: true },
        },
        translations: {
          columns: {
            locale: true,
            name: true,
            description: true,
            shortDescription: true,
          },
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

  async execute(
    shopId: string,
    productId: string,
  ): Promise<ProductDetailResult | null> {
    try {
      const product = await this.queryProduct(shopId, productId);
      if (!product) return null;
      return this.mapResult(product);
    } catch (error) {
      this.logger.error(
        `Failed to fetch product ${productId} for shop ${shopId}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  private mapResult(product: DrizzleProduct): ProductDetailResult {
    const thumbnail = product.thumbnail
      ? { id: product.thumbnail.id, url: product.thumbnail.url }
      : null;

    const translations = product.translations.map((t) => ({
      locale: t.locale,
      name: t.name,
      description: t.description,
      shortDescription: t.shortDescription,
    }));

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
      slug: product.slug,
      productType: product.productType,
      status: product.status,
      thumbnail,
      translations,
      variants,
      stockBreakdown: {
        totalStock,
        availableStock: totalStock,
        reservedStock: 0,
        lowStockCount,
      },
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
