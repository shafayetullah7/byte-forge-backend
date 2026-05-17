export class CartItemDto {
  id: string;
  variantId: string;
  quantity: number;
  price: string;
  productName: string;
  productSlug: string;
  productType: string;
  shopId: string;
  thumbnail: { id: string; url: string } | null;
}

export class CartDto {
  id: string;
  itemsCount: number;
  items: CartItemDto[];
  createdAt: string;
  updatedAt: string;
}
