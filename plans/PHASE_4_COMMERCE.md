# Phase 4: Commerce (Transaction Engine) - Execution Plan

This plan describes the functional requirements and implementation tasks for enabling secure nationwide trading.

---

## Overview

The goal of Phase 4 is to enable secure nationwide trading. The key features include persistent cart with stock validation, local payment integration (bKash/SSLCommerz), and order state machine progressing from PREP to SHIPPED to COMPLETE.

---

## Key Features

### Persistent Cart & Stock Validation
Users should be able to save their shopping cart across sessions. Cart items should be validated for stock availability before checkout. Prices should be checked against current values and updated if changed.

### Local Payment Integration
Support for Bangladesh's popular payment methods including bKash, Nagad, SSLCommerz, and Cash on Delivery. Secure payment processing with webhook handling for status updates.

### Order State Machine
Complete order lifecycle management from pending through confirmed, preparing, shipped, delivered. Support for cancellations and refunds at appropriate stages.

---

## 4. Admin Panel

The admin panel provides comprehensive control over orders, payments, and commerce across the platform.

### Order Management
- Admin should be able to view all orders across the platform with filtering by status, shop, date range, payment status.
- Admin should be able to search orders by order number, customer name, phone.
- Admin should be able to view any order's complete details including items, timeline, payment info.
- Admin should be able to update order status for any order.
- Admin should be able to cancel orders and process refunds.
- Admin should be able to add internal notes to orders.
- Admin should be able to view order analytics and statistics.
- Admin should be able to export orders to CSV or Excel.

### Payment Management
- Admin should be able to view all payment transactions across platform.
- Admin should be able to view payment details including gateway response.
- Admin should be able to manually verify or reject payments.
- Admin should be able to process refunds including partial refunds.
- Admin should be able to view payment success and failure rates.
- Admin should be able to monitor payment gateway performance.
- Admin should be able to reconcile payments with orders.

### Shipping Configuration
- Admin should be able to view shipping zones across all shops.
- Admin should be able to view shipping rates for any shop.
- Admin should be able to set platform-wide shipping defaults.
- Admin should be able to configure shipping rules for specific regions.
- Admin should be able to view shipping performance metrics.

### Dispute Management
- Admin should be able to view customer disputes and complaints.
- Admin should be able to view communication between buyer and seller.
- Admin should be able to mediate disputes and make decisions.
- Admin should be able to issue partial or full refunds for disputes.
- Admin should be able to resolve order issues and close cases.

### Commerce Analytics
- Admin should be able to view platform-wide sales statistics.
- Admin should be able to see revenue by shop, by period.
- Admin should be able to track conversion rates.
- Admin should be able to monitor cart abandonment rates.
- Admin should be able to view top performing products and shops.
- Admin should be able to generate financial reports.

---

## Detailed Implementation Steps

### Database Layer

#### 1.1 Cart Management
Create carts table with fields for id (UUID), userId (UUID for FK to users, nullable for guest), sessionId (varchar for guest carts), status (enum: active, merged, converted), expiresAt (timestamp for cart TTL), createdAt, and updatedAt.

Create cart_items table with fields for id (UUID), cartId (UUID for FK to carts), variantId (UUID for FK to plant_variants), quantity (integer), priceAtAdd (integer for price snapshot), createdAt, and updatedAt.

Create cart_item_customizations table for optional customizations with fields for id (UUID), cartItemId (UUID for FK to cart_items), giftWrap (boolean), giftMessage (text), and personalization (text).

---

#### 1.2 Order Management
Create orders table with comprehensive fields including id (UUID), orderNumber (varchar unique and human-readable), userId (UUID for FK to users), shopId (UUID for FK to shops for per-shop orders), status (enum: pending, confirmed, preparing, shipped, delivered, cancelled, refunded), paymentStatus (enum: pending, paid, failed, refunded, partially_refunded), paymentMethod (enum: bKash, nagad, sslcommerz, cod), paymentReference (varchar for gateway transaction ID), subtotal, shippingCost, tax, discount, total (all as integers), shippingAddressId and billingAddressId (UUIDs for FK to user_addresses), notes, adminNotes, createdAt, and updatedAt.

Create order_items table with fields for id (UUID), orderId (UUID for FK to orders), variantId (UUID for FK to plant_variants), plantName and variantName (varchar snapshots), quantity, unitPrice, totalPrice (all integers), imageUrl (varchar snapshot), and createdAt.

Create order_status_history table for tracking changes with fields for id (UUID), orderId (UUID for FK to orders), fromStatus (enum nullable), toStatus (enum), note (text), changedBy (UUID for FK to users), and createdAt.

---

#### 1.3 Payment Management
Create payments table with fields for id (UUID), orderId (UUID for FK to orders), amount (integer), currency (varchar default BDT), method (enum: bKash, nagad, sslcommerz, cod), status (enum: pending, processing, success, failed, cancelled, refunded), gatewayTransactionId and gatewayOrderId (varchar), paymentToken (varchar for redirect flows), metadata (jsonb), createdAt, and updatedAt.

Create refunds table with fields for id (UUID), paymentId (UUID for FK to payments), orderId (UUID for FK to orders), amount (integer), reason (text), status (enum: pending, approved, processed, rejected), gatewayRefundId (varchar), processedAt (timestamp), createdAt, and updatedAt.

---

#### 1.4 Shipping & Address
Create user_addresses table with fields for id (UUID), userId (UUID for FK to users), type (enum: shipping, billing, both), name (varchar for label like Home or Office), recipientName, phone, alternativePhone (varchar), addressLine1 and addressLine2 (varchar), city, district, division, postalCode, country (varchar default Bangladesh), isDefault (boolean), createdAt, and updatedAt.

Create shipping_zones table with fields for id (UUID), shopId (UUID for FK to shops), name (varchar), regions (varchar array for covered districts/divisions), isActive (boolean), createdAt, and updatedAt.

Create shipping_rates table with fields for id (UUID), zoneId (UUID for FK to shipping_zones), name (varchar for rate name like Standard or Express), baseCost (integer), costPerKg (integer), freeShippingMin (integer for order threshold), estimatedDaysMin and estimatedDaysMax (integer), isActive (boolean), createdAt, and updatedAt.

---

### Service Layer

#### 2.1 Cart Service
Create Cart/cart/cart Service at src/modules.service.ts with methods including getOrCreateCart (userId, sessionId) to get existing or create new cart, addItem (cartId, variantId, quantity) to add plant to cart, updateItemQuantity (cartId, itemId, quantity) to change quantity, removeItem (cartId, itemId) to remove item, clearCart (cartId) to remove all items, mergeGuestCart (guestCartId, userId) to combine carts on login, applyCoupon (cartId, code) to add discount, removeCoupon (cartId) to remove discount, getCartTotals (cartId) to calculate subtotal, validateStock (cartId) to check all items in stock, and expireOldCarts ( ) to clean up inactive carts as a scheduled job.

Business rules include: Cart expires after 7 days of inactivity, maximum 50 items per cart, quantity limited to available stock, and prices update if item price changed since adding.

---

#### 2.2 Order Service
Create Order Service at src/modules/order/order.service.ts with methods including createOrder (userId, cartId, shippingAddress, paymentMethod) to create order, getOrderById (orderId) to fetch order with items, getOrderByNumber (orderNumber) to fetch by order number, getOrdersByUser (userId) for user's order history, getOrdersByShop (shopId) for shop's orders, updateOrderStatus (orderId, newStatus, note) to change status, addOrderNote (orderId, note) to add internal note, cancelOrder (orderId, reason) to cancel order, and getOrderTimeline (orderId) for status history.

The order status flow follows: pending transitions to confirmed to preparing to shipped to delivered, with cancellation possible from any state and refunds possible from paid states.

Create Order Calculation Service at src/modules/order/order-calculation.service.ts with methods including calculateOrderTotals (cartId, shippingMethod) to compute all costs, calculateShippingCost (shopId, address, weight) for shipping fee, calculateTax (address) for tax based on location, applyDiscount (orderTotal, code) for discount validation, and calculateSellerCommission (orderTotal) for platform fee.

---

#### 2.3 Payment Gateway Integration
Create Payment Service at src/modules/payment/payment.service.ts with methods including initiatePayment (orderId, method) to start payment, verifyPayment (paymentId, gatewayData) to confirm payment, processRefund (paymentId, amount, reason) to initiate refund, handleWebhook (event) to process gateway callback, and getPaymentStatus (paymentId) for current status.

Supported payment methods include bKash with Payment URL, MRP, and webhook support, Nagad with Payment URL, Ref ID, and webhook support, SSLCommerz with Payment URL, validation, and webhook support, and Cash on Delivery for no online payment.

Create bKash Integration at src/modules/payment/gateways/bkash.service.ts with methods including createPayment (amount, intent) to generate payment URL, executePayment (token) to complete payment, queryPayment (paymentId) to check status, refundPayment (paymentId, amount) to process refund, and registerWebhook (url) to set callback URL.

Webhook events handled include payment_initiated, payment_executed, payment_failed, payment_cancelled, and refund_processed.

Create SSLCommerz Integration at src/modules/payment/gateways/sslcommerz.service.ts with methods including checkoutSession (order) to generate checkout URL, validateOrder (tranId) to verify payment, refundRequest (paymentId, amount) to process refund, and refundStatus (refundId) to check status.

Create Cash on Delivery Service at src/modules/payment/gateways/cod.service.ts with methods including createCODOrder (order) to confirm COD, markAsPaid (orderId) to confirm payment received, and markAsFailed (orderId, reason) for payment failure.

---

#### 2.4 Shipping Service
Create Shipping Service at src/modules/shipping/shipping.service.ts with methods including getShippingZones (shopId) for available zones, getShippingRates (shopId, zoneId) for rates in a zone, calculateShipping (shopId, address, items) to get shipping options, getDeliveryEstimate (rateId, address) for estimated delivery date, validateShippingAddress (address) to check if deliverable, and getOrderShippingLabel (orderId) to generate shipping info.

Create Shipping Rate Calculator at src/modules/shipping/shipping-rate.calculator.ts with methods including calculateBaseRate (zone, weight) for standard shipping, calculateExpressSurcharge (baseRate) for fast delivery, calculateRemoteAreaSurcharge (baseRate, district) for remote fee, calculateFreeShipping (orderTotal, rate) to apply free threshold, and getAllOptions (shopId, address, cart) for sorted options.

---

### Admin Service Layer

#### 3.1 Admin Order Service
Create Admin Order Service at src/modules/admin/order-admin.service.ts with methods: getAllOrders (filters, pagination) to list orders across platform, getOrderDetails (orderId) to fetch full order for admin, updateOrderStatusAsAdmin (orderId, status, note, adminId) to force status change, cancelOrderAsAdmin (orderId, reason, adminId) to cancel any order, addAdminNote (orderId, note, adminId) to add internal note, getOrderAnalytics (dateRange) to get sales stats, exportOrders (filters, format) to generate CSV or Excel, and getDisputedOrders ( ) to get orders with disputes.

#### 3.2 Admin Payment Service
Create Admin Payment Service at src/modules/admin/payment-admin.service.ts with methods: getAllPayments (filters, pagination) to list payments, getPaymentDetails (paymentId) to view full payment info, verifyPaymentManually (paymentId, adminId) to approve manually, processRefundAsAdmin (paymentId, amount, reason, adminId) to issue refund, getPaymentAnalytics (dateRange) to get payment stats, getRefundHistory (filters) to see all refunds, and reconcilePayments (dateRange) to match with orders.

#### 3.3 Admin Dispute Service
Create Admin Dispute Service at src/modules/admin/dispute-admin.service.ts with methods: getOpenDisputes ( ) to list unresolved disputes, getDisputeDetails (disputeId) to view full case, respondToDispute (disputeId, response, adminId) to add admin response, resolveDispute (disputeId, resolution, adminId) to close dispute, issueRefundForDispute (orderId, amount, reason, adminId) to process refund, and getDisputeStatistics ( ) to see dispute trends.

#### 3.4 Admin Commerce Analytics
Create Admin Analytics Service at src/modules/admin/commerce-analytics.service.ts with methods: getSalesOverview (dateRange) to get total revenue and orders, getSalesByShop (dateRange) to see shop performance, getSalesByCategory (dateRange) to see category breakdown, getConversionFunnel (dateRange) to track cart to purchase, getAbandonedCarts (dateRange) to see cart abandonment, getTopProducts (limit) to see best sellers, and generateFinancialReport (dateRange, format) to create reports.

---

### API Layer

#### 4.1 Cart Resolvers
Create Cart Query Resolver at src/api/cart/cart.resolver.ts with queries including myCart to get current user's cart, cartById (id: UUID!) for specific cart (owner only), and cartValidation (cartId: UUID!) for stock check result.

Create Cart Mutation Resolver with mutations including addToCart (variantId: UUID!, quantity: Int!) to add item, updateCartItem (itemId: UUID!, quantity: Int!) to change quantity, removeFromCart (itemId: UUID!) to remove item, clearCart to empty cart, applyCoupon (code: String!) to add discount, removeCoupon to remove discount, and mergeGuestCart (guestCartId: UUID!) to combine carts.

---

#### 4.2 Order Resolvers
Create Order Query Resolver at src/api/order/order.resolver.ts with queries including order (id: UUID!) for single order, orderByNumber (number: String!) for fetching by order number, myOrders (pagination, filters) for user's orders, shopOrders (shopId: UUID!, pagination, filters) for shop's orders, and orderTimeline (orderId: UUID!) for status history.

Create Order Mutation Resolver with mutations including createOrder (input: CreateOrderInput!) for checkout, updateOrderStatus (id: UUID!, status: OrderStatus!, note: String) to change status, cancelOrder (id: UUID!, reason: String!) to cancel order, addOrderNote (id: UUID!, note: String!) to add internal note, and requestRefund (orderId: UUID!, reason: String!) to request refund.

Buyer mutations include confirmOrderReceived (orderId: UUID!). Seller mutations include markAsPreparing (orderId: UUID!), markAsShipped (orderId: UUID!, trackingInfo: String), and rejectCancellation (orderId: UUID!, reason: String!).

---

#### 4.3 Payment Resolvers
Create Payment Query Resolver at src/api/payment/payment.resolver.ts with queries including payment (id: UUID!), paymentByOrder (orderId: UUID!), and refund (id: UUID!).

Create Payment Mutation Resolver with mutations including initiatePayment (orderId: UUID!, method: PaymentMethod!) to start payment, verifyPayment (paymentId: UUID!, verificationData: JSON!) to confirm payment, requestRefund (orderId: UUID!, amount: Int, reason: String!) to request refund, and cancelPayment (paymentId: UUID!) to cancel payment.

Webhook mutations (internal) include handlePaymentWebhook (event: PaymentWebhookInput!).

---

### Admin API Layer

#### 5.1 Admin Order Resolvers
Create Admin Order Resolver at src/api/admin/order-admin.resolver.ts with admin queries: adminAllOrders (filters, pagination), adminOrderById (id: UUID!), adminOrderTimeline (orderId: UUID!), adminDisputedOrders, adminOrderAnalytics (dateRange).

Admin mutations include adminUpdateOrderStatus, adminCancelOrder, adminAddOrderNote, and adminExportOrders.

#### 5.2 Admin Payment Resolvers
Create Admin Payment Resolver at src/api/admin/payment-admin.resolver.ts with admin queries: adminAllPayments (filters), adminPaymentDetails (id), adminPaymentAnalytics (dateRange), adminRefundHistory.

Admin mutations include adminVerifyPayment, adminProcessRefund.

#### 5.3 Admin Dispute Resolvers
Create Admin Dispute Resolver at src/api/admin/dispute-admin.resolver.ts with admin queries: adminOpenDisputes, adminDisputeDetails (id), adminDisputeStatistics.

Admin mutations include adminRespondToDispute, adminResolveDispute, adminIssueDisputeRefund.

---

### Checkout Flow

#### 6.1 Checkout Service
Create Checkout Service at src/modules/checkout/checkout.service.ts that orchestrates the complete checkout process.

Step 1 is Validate Cart which checks all items in stock, verifies items still available, confirms prices unchanged, and ensures cart not expired.

Step 2 is Validate Shipping which validates address is complete, gets available shipping options, and calculates shipping cost.

Step 3 is Calculate Totals which computes subtotal, shipping cost, tax if applicable, discount, and final total.

Step 4 is Create Order which creates order record, creates order items with snapshot data, reserves stock, and clears cart.

Step 5 is Initiate Payment which calls payment gateway and returns payment URL or token.

---

### Testing

#### 7.1 Unit Tests
Write Cart Service Tests at src/modules/cart/__tests__/cart.service.spec.ts covering test cases for addItem (success, out of stock, max quantity), updateQuantity (increase, decrease, remove), cart merge (combine guest plus user cart), and price update (recalculate on price change).

Write Order Service Tests at src/modules/order/__tests__/order.service.spec.ts covering test cases for createOrder (success, stock validation), status transitions (valid and invalid flows), cancellation (refund calculation), and order timeline (correct history).

Write Payment Gateway Tests at src/modules/payment/__tests__/payment.service.spec.ts covering test cases for payment initiation (URL generation), payment verification (success, failure), refund processing (full, partial), and webhook handling (all event types).

#### 7.2 Integration Tests
Write Checkout Flow Tests at src/modules/checkout/__tests__/checkout.service.spec.ts covering test cases for full checkout (cart to order to payment), stock reservation (concurrent checkouts), out of stock (rollback scenario), and payment failure (cleanup).

---

## Implementation Order

Week 1 focuses on Database Schemas plus Address Services. Week 2 covers Cart Service plus Cart Resolvers. Week 3 includes Order Service plus Order Resolvers. Week 4 addresses Payment Gateways (bKash, SSLCommerz). Week 5 handles Shipping Services plus Checkout Flow plus Admin Panel. Week 6 is reserved for Testing plus Documentation plus Bug Fixes.

---

## Dependencies

The implementation depends on Phase 2 (Core Catalog) being complete for products, Phase 3 (Logistics) being complete for stock, Payment gateway APIs (bKash, SSLCommerz), and Notification service (for order updates).

---

## Success Criteria

Users can add plants to persistent cart. Cart persists across sessions. Stock is validated during checkout. Orders created with all details. Admin can view and manage all orders. Admin can process payments and refunds. Order status can be tracked. Payment integration works (bKash, SSLCommerz, COD). Refunds can be processed. Shipping rates calculate correctly. Order history accessible to users. Sellers can manage orders. Dispute resolution works. Commerce analytics available.
