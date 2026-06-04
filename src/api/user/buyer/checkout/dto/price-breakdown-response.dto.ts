export type StockStatus =
  | 'in_stock'
  | 'low_stock'
  | 'out_of_stock';

export class CheckoutCartItemDto {
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
  stockStatus: StockStatus;
  availableQuantity: number | null;
  variantTitle?: string;
  sku?: string;
}

export class ShopPriceBreakdownDto {
  shopId: string;
  shopName: string;
  items: CheckoutCartItemDto[];
  itemsSubtotal: string;
  shippingCost: string;
}

export class PriceBreakdownDto {
  subtotal: string;
  shipping: string;
  tax: string;
  total: string;
  shopBreakdowns: ShopPriceBreakdownDto[];
}

export class PriceBreakdownResponseDto {
  breakdown: PriceBreakdownDto;
}
