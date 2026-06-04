import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CartRepository } from '@/_repositories/user/cart.repository';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { shopShippingRatesTable } from '@/_db/drizzle/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { resolveTranslation } from '@/common/utils/resolve-translation.util';
import {
  computeStockStatus,
  computeLineTotal,
} from '@/api/user/buyer/cart/cart.utils';

export type CheckoutCartItem = {
  id: string;
  variantId: string;
  quantity: number;
  price: string;
  lineTotal: string;
  productName: string;
  productSlug: string;
  shopId: string;
  shopName: string;
  thumbnail: { id: string; url: string } | null;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  availableQuantity: number | null;
  variantTitle?: string;
  sku?: string;
};

export type ShopBreakdown = {
  shopId: string;
  shopName: string;
  items: CheckoutCartItem[];
  itemsSubtotal: string;
  shippingCost: string;
};

export type PriceBreakdownResult = {
  subtotal: string;
  shipping: string;
  tax: string;
  total: string;
  shopBreakdowns: ShopBreakdown[];
};

@Injectable()
export class CalculatePriceBreakdownService {
  private readonly logger = new Logger(CalculatePriceBreakdownService.name);

  constructor(
    private readonly cartRepository: CartRepository,
    private readonly db: DrizzleService,
  ) {}

  async executeByCartId(
    cartId: string,
    districtId: string,
    locale: string = 'en',
  ): Promise<PriceBreakdownResult> {
    try {
      const cart = await this.cartRepository.getCartWithItemsAndShopById(cartId);

      if (!cart || cart.items.length === 0) {
        return {
          subtotal: '0',
          shipping: '0',
          tax: '0',
          total: '0',
          shopBreakdowns: [],
        };
      }

      const variantIds = cart.items.map((item) => item.variantId);
      const inventories =
        await this.cartRepository.getInventoryByVariantIds(variantIds);
      const inventoryMap = new Map(
        inventories.map((inv) => [inv.variantId, inv]),
      );

      // Build cart items with shop names
      const items: CheckoutCartItem[] = cart.items.map((item) => {
        const variant = item.variant;
        const product = variant?.product;
        const shop = product?.shop;
        const translation = product?.translations?.find(
          (t) => t.locale === locale,
        );
        const variantTranslation = variant?.translations?.find(
          (t) => t.locale === locale,
        );
        const shopTranslation = resolveTranslation(shop?.translations ?? null, locale);
        const inventory = inventoryMap.get(item.variantId) ?? null;
        const stockInfo = computeStockStatus(inventory);

        const price = variant?.price ?? '0.00';
        const lineTotal = computeLineTotal(price, item.quantity);

        return {
          id: item.id,
          variantId: item.variantId,
          quantity: item.quantity,
          price,
          lineTotal,
          productName: translation?.name ?? 'Unknown Product',
          productSlug: product?.slug ?? '',
          shopId: product?.shopId ?? '',
          shopName: shopTranslation?.name ?? 'Unknown Shop',
          thumbnail: product?.thumbnail
            ? { id: product.thumbnail.id, url: product.thumbnail.url }
            : null,
          stockStatus: stockInfo.stockStatus,
          availableQuantity: stockInfo.availableQuantity,
          variantTitle: variantTranslation?.title ?? undefined,
          sku: variant?.sku ?? undefined,
        };
      });

      // Group items by shop
      const shopGroups = new Map<string, CheckoutCartItem[]>();
      for (const item of items) {
        const existing = shopGroups.get(item.shopId) || [];
        existing.push(item);
        shopGroups.set(item.shopId, existing);
      }

      // Fetch shipping rates for all shops for this district
      const shopIds = Array.from(shopGroups.keys());
      const shippingRates = await this.db.client.query.shopShippingRatesTable.findMany({
        where: and(
          inArray(shopShippingRatesTable.shopId, shopIds),
          eq(shopShippingRatesTable.districtId, districtId),
        ),
      });

      const rateMap = new Map<string, string>();
      for (const rate of shippingRates) {
        rateMap.set(rate.shopId, rate.cost);
      }

      // Build shop breakdowns
      const shopBreakdowns: ShopBreakdown[] = [];
      let subtotal = 0;
      let totalShipping = 0;

      for (const [shopId, shopItems] of shopGroups) {
        const itemsSubtotal = shopItems.reduce(
          (sum, item) => sum + parseFloat(item.lineTotal),
          0,
        );
        const shippingCost = parseFloat(rateMap.get(shopId) ?? '0');

        totalShipping += shippingCost;
        subtotal += itemsSubtotal;

        shopBreakdowns.push({
          shopId,
          shopName: shopItems[0].shopName,
          items: shopItems,
          itemsSubtotal: itemsSubtotal.toFixed(2),
          shippingCost: shippingCost.toFixed(2),
        });
      }

      const tax = 0; // Tax calculation placeholder

      return {
        subtotal: subtotal.toFixed(2),
        shipping: totalShipping.toFixed(2),
        tax: tax.toFixed(2),
        total: (subtotal + totalShipping + tax).toFixed(2),
        shopBreakdowns,
      };
    } catch (error) {
      this.logger.error(
        `Failed to calculate price breakdown for cart ${cartId}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
