import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CartRepository } from '@/_repositories/user/cart.repository';
import { UserAddressRepository } from '@/_repositories/user/user-address.repository';
import { OrderRepository } from '@/_repositories/user/order.repository';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import {
  shopShippingRatesTable,
  districtsTable,
  districtTranslationsTable,
  orderGroupsTable,
  ordersTable,
} from '@/_db/drizzle/schema';
import { eq, and, inArray, desc, like } from 'drizzle-orm';
import { OrderStatusEnum, PaymentStatusEnum } from '@/_db/drizzle/enum';
import type { TPaymentMethod } from '@/_db/drizzle/enum/payment-method.enum';
import { computeStockStatus } from '@/api/user/buyer/cart/cart.utils';
import { resolveTranslation } from '@/common/utils/resolve-translation.util';
import { CheckoutPaymentMethodService } from './checkout-payment-method.service';
import { OrderInventoryService } from '@/common/services/order/order-inventory.service';

export interface PlaceOrderItem {
  id: string;
  variantId: string;
  productId: string;
  quantity: number;
  price: string;
  productName: string;
  productSlug: string;
  shopId: string;
  shopName: string;
  variantTitle?: string;
  sku?: string;
}

export interface PlaceOrderResult {
  orderGroupId: string;
  orderNumbers: string[];
  totalAmount: string;
  orders: {
    orderId: string;
    orderNumber: string;
    shopId: string;
    shopName: string;
    total: string;
    itemCount: number;
  }[];
}

@Injectable()
export class PlaceOrderService {
  private readonly logger = new Logger(PlaceOrderService.name);

  constructor(
    private readonly cartRepository: CartRepository,
    private readonly addressRepository: UserAddressRepository,
    private readonly orderRepository: OrderRepository,
    private readonly db: DrizzleService,
    private readonly checkoutPaymentMethodService: CheckoutPaymentMethodService,
    private readonly orderInventoryService: OrderInventoryService,
  ) {}

  async execute(
    cartId: string,
    userId: string,
    addressId: string,
    itemIds: string[],
    paymentMethod: TPaymentMethod,
    notes?: string,
    lang: string = 'en',
  ): Promise<PlaceOrderResult> {
    const catalogMethod =
      await this.checkoutPaymentMethodService.resolveActivePaymentMethod(
        paymentMethod,
      );

    const address = await this.addressRepository.findById(addressId);
    if (!address) {
      throw new NotFoundException('Shipping address not found');
    }

    if (address.userId !== userId) {
      throw new BadRequestException('This address does not belong to you');
    }

    const cart = await this.cartRepository.getCartWithItemsAndShopById(cartId);
    if (!cart || cart.items.length === 0) {
      throw new NotFoundException('Cart is empty');
    }

    const itemIdSet = new Set(itemIds);
    const selectedItems = cart.items.filter((item) => itemIdSet.has(item.id));

    if (selectedItems.length === 0) {
      throw new BadRequestException('No valid items selected for order');
    }

    const variantIds = selectedItems.map((item) => item.variantId);
    const inventories =
      await this.cartRepository.getInventoryByVariantIds(variantIds);
    const inventoryMap = new Map(
      inventories.map((inv) => [inv.variantId, inv]),
    );

    const items: PlaceOrderItem[] = selectedItems.map((item) => {
      const variant = item.variant;
      const product = variant?.product;
      const shop = product?.shop;
      const translation = product?.translations?.find((t) => t.locale === lang);
      const variantTranslation = variant?.translations?.find(
        (t) => t.locale === lang,
      );
      const shopTranslation = resolveTranslation(
        shop?.translations ?? null,
        lang,
      );

      return {
        id: item.id,
        variantId: item.variantId,
        productId: product?.id ?? '',
        quantity: item.quantity,
        price: variant?.price ?? '0.00',
        productName: translation?.name ?? 'Unknown Product',
        productSlug: product?.slug ?? '',
        shopId: product?.shopId ?? '',
        shopName: shopTranslation?.name ?? 'Unknown Shop',
        variantTitle: variantTranslation?.title ?? undefined,
        sku: variant?.sku ?? undefined,
      };
    });

    const stockCheckErrors: string[] = [];
    for (const item of items) {
      const inventory = inventoryMap.get(item.variantId) ?? null;
      const stockInfo = computeStockStatus(inventory);

      if (stockInfo.stockStatus === 'out_of_stock') {
        stockCheckErrors.push(`${item.productName} is out of stock`);
      } else if (
        stockInfo.stockStatus === 'low_stock' &&
        stockInfo.availableQuantity !== null &&
        stockInfo.availableQuantity < item.quantity
      ) {
        stockCheckErrors.push(
          `Insufficient stock for ${item.productName}. Available: ${stockInfo.availableQuantity}, Requested: ${item.quantity}`,
        );
      }
    }

    if (stockCheckErrors.length > 0) {
      throw new BadRequestException(stockCheckErrors);
    }

    const shopGroups = new Map<string, PlaceOrderItem[]>();
    for (const item of items) {
      const existing = shopGroups.get(item.shopId) || [];
      existing.push(item);
      shopGroups.set(item.shopId, existing);
    }

    const districtId = address.districtId;

    const shippingRates =
      await this.db.client.query.shopShippingRatesTable.findMany({
        where: and(
          inArray(shopShippingRatesTable.shopId, Array.from(shopGroups.keys())),
          eq(shopShippingRatesTable.districtId, districtId),
        ),
      });

    const rateMap = new Map<string, string>();
    for (const rate of shippingRates) {
      rateMap.set(rate.shopId, rate.cost);
    }

    const districtResult = await this.db.client
      .select({
        districtName: districtTranslationsTable.name,
      })
      .from(districtsTable)
      .leftJoin(
        districtTranslationsTable,
        eq(districtsTable.id, districtTranslationsTable.districtId),
      )
      .where(
        and(
          eq(districtsTable.id, districtId),
          eq(districtTranslationsTable.locale, lang),
        ),
      )
      .execute();

    const districtName = districtResult[0]?.districtName ?? '';

    return await this.db.transaction(async (tx) => {
      let groupTotal = 0;
      const orderResults: PlaceOrderResult['orders'] = [];
      const orderNumbers: string[] = [];

      const orderGroup = await this.orderRepository.createOrderGroup(
        {
          userId,
          totalAmount: '0',
        },
        { tx },
      );

      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const prefix = `BF-${year}-${month}-`;

      const lastOrder = await this.db.client
        .select({ orderNumber: ordersTable.orderNumber })
        .from(ordersTable)
        .where(like(ordersTable.orderNumber, `${prefix}%`))
        .orderBy(desc(ordersTable.orderNumber))
        .limit(1)
        .execute();

      let orderCounter =
        lastOrder.length > 0
          ? parseInt(lastOrder[0].orderNumber.split('-').pop() ?? '0', 10)
          : 0;

      for (const [shopId, shopItems] of shopGroups) {
        const itemsSubtotal = shopItems.reduce(
          (sum, item) => sum + parseFloat(item.price) * item.quantity,
          0,
        );
        const shippingCost = parseFloat(rateMap.get(shopId) ?? '0');
        const tax = 0;
        const shopTotal = itemsSubtotal + shippingCost + tax;

        groupTotal += shopTotal;
        orderCounter++;

        const orderNumber = `${prefix}${String(orderCounter).padStart(4, '0')}`;

        const order = await this.orderRepository.createOrder(
          {
            orderNumber,
            userId,
            shopId,
            groupId: orderGroup.id,
            status: OrderStatusEnum.PENDING_PAYMENT,
            subtotal: itemsSubtotal.toFixed(2),
            shippingCost: shippingCost.toFixed(2),
            tax: tax.toFixed(2),
            total: shopTotal.toFixed(2),
            paymentStatus: PaymentStatusEnum.PENDING,
            paymentMethod: catalogMethod.key,
            paymentMethodId: catalogMethod.id,
            notes: notes ?? null,
          },
          { tx },
        );

        orderNumbers.push(order.orderNumber);

        const orderItemsData = shopItems.map((item) => ({
          orderId: order.id,
          variantId: item.variantId,
          productId: item.productId,
          productName: item.productName,
          variantTitle: item.variantTitle ?? null,
          sku: item.sku ?? null,
          unitPrice: item.price,
          quantity: item.quantity,
          subtotal: (parseFloat(item.price) * item.quantity).toFixed(2),
        }));

        await this.orderRepository.createOrderItems(orderItemsData, { tx });

        await this.orderInventoryService.reserveForOrder(
          shopItems.map((item) => ({
            variantId: item.variantId,
            shopId: item.shopId,
            quantity: item.quantity,
            productName: item.productName,
          })),
          order.id,
          userId,
          tx,
        );

        await this.orderRepository.createOrderAddress(
          {
            orderId: order.id,
            recipientName: address.recipientName,
            phone: address.phone,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2 ?? null,
            city: districtName,
            state: null,
            postalCode: address.postalCode ?? null,
            country: address.country,
            companyName: address.companyName ?? null,
            deliveryInstructions: address.deliveryInstructions ?? null,
          },
          { tx },
        );

        await this.orderRepository.createOrderStatusHistory(
          {
            orderId: order.id,
            fromStatus: null,
            toStatus: OrderStatusEnum.PENDING_PAYMENT,
            notes: `Order placed with ${catalogMethod.displayName}`,
            changedBy: userId,
          },
          { tx },
        );

        orderResults.push({
          orderId: order.id,
          orderNumber: order.orderNumber,
          shopId,
          shopName: shopItems[0].shopName,
          total: shopTotal.toFixed(2),
          itemCount: shopItems.length,
        });
      }

      await this.db.client
        .update(orderGroupsTable)
        .set({ totalAmount: groupTotal.toFixed(2) })
        .where(eq(orderGroupsTable.id, orderGroup.id));

      await this.cartRepository.deleteCartItemsByIds(itemIds, { tx });

      return {
        orderGroupId: orderGroup.id,
        orderNumbers,
        totalAmount: groupTotal.toFixed(2),
        orders: orderResults,
      };
    });
  }
}
