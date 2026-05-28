import { Injectable, Logger } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { productsTable } from '@/_db/drizzle/schema';

export type ProductSummaryResult = {
  id: string;
  slug: string;
  productType: string;
  status: string;
  name: string;
  shortDescription: string | null;
};

type DrizzleSummary = NonNullable<
  Awaited<ReturnType<GetProductSummaryService['queryProduct']>>
>;

@Injectable()
export class GetProductSummaryService {
  private readonly logger = new Logger(GetProductSummaryService.name);

  constructor(private readonly db: DrizzleService) {}

  private queryProduct(shopId: string, productId: string, lang: string) {
    return this.db.client.query.productsTable.findFirst({
      where: and(eq(productsTable.shopId, shopId), eq(productsTable.id, productId)),
      columns: {
        id: true,
        slug: true,
        productType: true,
        status: true,
      },
      with: {
        translations: {
          where: (t, { eq }) => eq(t.locale, lang),
          columns: { name: true, shortDescription: true },
        },
      },
    });
  }

  async execute(shopId: string, productId: string, lang: string = 'en'): Promise<ProductSummaryResult | null> {
    try {
      const product = await this.queryProduct(shopId, productId, lang);
      if (!product) return null;
      return this.mapResult(product);
    } catch (error) {
      this.logger.error(
        `Failed to fetch product summary ${productId} for shop ${shopId}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  private mapResult(product: DrizzleSummary): ProductSummaryResult {
    const translation = product.translations[0] ?? { name: '', shortDescription: null };
    return {
      id: product.id,
      slug: product.slug,
      productType: product.productType,
      status: product.status,
      name: translation.name,
      shortDescription: translation.shortDescription,
    };
  }
}
