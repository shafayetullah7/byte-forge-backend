import type { TInventory } from '@/_db/drizzle/schema';
import type { StockStatus } from './dto/cart-response.dto';

export function computeStockStatus(inventory: TInventory | null | undefined): {
  stockStatus: StockStatus;
  availableQuantity: number | null;
  maxQuantity: number;
} {
  if (!inventory || !inventory.trackInventory) {
    return {
      stockStatus: 'in_stock',
      availableQuantity: null,
      maxQuantity: 999,
    };
  }
  const available = inventory.quantity - inventory.reservedQuantity;
  const stockStatus: StockStatus =
    available <= 0
      ? 'out_of_stock'
      : available <= inventory.lowStockThreshold
        ? 'low_stock'
        : 'in_stock';
  return {
    stockStatus,
    availableQuantity: available,
    maxQuantity: Math.max(0, available),
  };
}

export function computeCartTotals(
  items: { price: string; quantity: number }[],
): { totalQuantity: number; subtotal: string } {
  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce(
    (sum, i) => sum + parseFloat(i.price) * i.quantity,
    0,
  );
  return {
    totalQuantity,
    subtotal: subtotal.toFixed(2),
  };
}

export function computeLineTotal(price: string, quantity: number): string {
  return (parseFloat(price) * quantity).toFixed(2);
}
