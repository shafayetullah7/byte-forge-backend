export class OrderItemResponseDto {
  id: string;
  productName: string;
  variantTitle: string | null;
  quantity: number;
  total: string;
  thumbnail: { id: string; url: string } | null;
}

export class OrderResponseDto {
  id: string;
  orderNumber: string;
  shopId: string;
  shopName: string;
  shopLogo: string | null;
  status: string;
  paymentStatus: string;
  total: string;
  createdAt: string;
  items: OrderItemResponseDto[];
}

export class OrderGroupResponseDto {
  id: string;
  totalAmount: string;
  createdAt: string;
  orders: OrderResponseDto[];
}

export class OrderStatsResponseDto {
  total: number;
  active: number;
  delivered: number;
  cancelled: number;
  totalSpent: string;
}

export class GetOrdersResponseDto {
  groups: OrderGroupResponseDto[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}
