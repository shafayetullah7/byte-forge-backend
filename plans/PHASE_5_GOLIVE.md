# Phase 5: Go-Live (Smarter Operations) - Execution Plan

This plan describes the functional requirements and implementation tasks for achieving full operational capacity.

---

## Overview

The goal of Phase 5 is to achieve full operational capacity. The key features include seller performance dashboards, shipping configuration engine with zones and care during transit, and automated notifications via SMS and email.

---

## Key Features

### Seller Performance Dashboards
Sellers need comprehensive analytics to understand their business performance. Dashboards should show sales trends, order volumes, customer metrics, inventory status, and revenue reports. Real-time data helps sellers make informed decisions.

### Shipping Config Engine
Advanced shipping configuration allows sellers to define delivery zones, set rates based on location and weight, specify plant-specific handling requirements, and configure transit care instructions to ensure plants arrive in good condition.

### Automated Notifications
Automated messaging keeps all parties informed throughout the order lifecycle. Email and SMS notifications should cover order confirmations, shipping updates, delivery notifications, and alerts for important events like low stock.

---

## 4. Admin Panel

The admin panel provides comprehensive control over platform operations, seller management, and system monitoring.

### Platform Dashboard
- Admin should be able to view real-time platform overview including total orders today, revenue today, active shops, new registrations.
- Admin should be able to see system health and performance metrics.
- Admin should be able to view recent activity feed.
- Admin should be able to access quick links to pending tasks.

### Seller Management
- Admin should be able to view all sellers with filtering by status, shop count, registration date.
- Admin should be able to view seller profiles and their shops.
- Admin should be able to suspend or deactivate seller accounts.
- Admin should be able to view seller performance across all their shops.
- Admin should be able to communicate with sellers directly.
- Admin should be able to manage seller verification status.

### Shipping Configuration Oversight
- Admin should be able to view shipping zones across all shops.
- Admin should be able to set platform-wide shipping defaults.
- Admin should be able to define restricted shipping areas.
- Admin should be able to configure seasonal shipping restrictions.
- Admin should be able to monitor shipping performance across platform.

### Notification Management
- Admin should be able to view all notification templates.
- Admin should be able to create and edit notification templates.
- Admin should be able to configure which notifications are enabled.
- Admin should be able to send bulk notifications to users.
- Admin should be able to view notification delivery status.
- Admin should be able to test notification delivery.

### User Management
- Admin should be able to view all platform users.
- Admin should be able to search users by email, name, phone.
- Admin should be able to view user profiles and order history.
- Admin should be able to manage user roles and permissions.
- Admin should be able to suspend or deactivate user accounts.

### System Configuration
- Admin should be able to configure platform settings including site name, logo, contact info.
- Admin should be able to manage payment gateway credentials.
- Admin should be able to configure email and SMS provider settings.
- Admin should be able to set commission rates and fees.
- Admin should be able to manage tax configurations.

### Audit Logs
- Admin should be able to view system audit logs for all admin actions.
- Admin should be able to search logs by action type, admin, date range.
- Admin should be able to export audit logs.
- Admin should be able to monitor suspicious activities.

### Reports and Analytics
- Admin should be able to generate comprehensive platform reports.
- Admin should be able to view revenue analytics by period.
- Admin should be able to track user growth and retention.
- Admin should be able to analyze conversion funnels.
- Admin should be able to export reports in multiple formats.

### Content Management
- Admin should be able to manage static pages like About, Terms, Privacy Policy.
- Admin should be able to manage homepage banner content.
- Admin should be able to manage featured collections.
- Admin should be able to manage promotional content.

---

## Detailed Implementation Steps

### Database Layer

#### 1.1 Analytics Schema
Create seller_analytics table with fields for id (UUID), shopId (UUID for FK to shops), date (date), period (enum: daily, weekly, monthly), totalOrders, totalRevenue, totalItemsSold, newCustomers, returningCustomers, pageViews, conversionRate (decimal), createdAt, and updatedAt.

Create product_performance table with fields for id (UUID), shopId (UUID for FK to shops), variantId (UUID for FK to plant_variants), date (date), views, addToCarts, purchases, revenue, conversionRate (decimal), createdAt, and updatedAt.

---

### Service Layer

#### 2.1 Analytics Service
Create Seller Analytics Service at src/modules/analytics/seller-analytics.service.ts with methods including getDashboardSummary (shopId) for key metrics overview, getSalesOverTime (shopId, period, dateRange) for revenue chart, getOrdersByStatus (shopId, dateRange) for order breakdown, getTopSellingProducts (shopId, limit) for best performers, getLowStockAlerts (shopId) for items needing restock, getCustomerMetrics (shopId, dateRange) for new versus returning customers, and getTrafficSources (shopId) for visitor sources.

Dashboard widgets include Today's Orders (count plus revenue), Pending Orders (need attention), Low Stock Items (alert list), Recent Reviews (customer feedback), Revenue Chart (line graph), and Top Products (bar chart).

#### 2.2 Reporting Service
Create Seller Report Service at src/modules/reporting/seller-report.service.ts with methods including generateSalesReport (shopId, dateRange) for detailed sales, generateInventoryReport (shopId) for stock levels, generatePayoutReport (shopId, dateRange) for earnings, exportReport (format) for PDF, Excel, CSV outputs, and scheduleReport (cron, recipients) for automated reports.

---

### Database Layer

#### 3.1 Plant Shipping Rules
Create plant_shipping_rules table with fields for id (UUID), shopId (UUID for FK to shops), plantType (enum: all, category_specific, variant_specific), categoryId (UUID nullable for specific categories), variantId (UUID nullable for specific variants), shippingMethod (enum: standard, express, freight), packagingType (enum: box, pot, hanging), requiresSpecialCare (boolean), maxHeightCm (integer), maxWeightKg (integer), handlingFee (integer), seasonalAvailability (jsonb), isActive (boolean), createdAt, and updatedAt.

#### 3.2 Transit Care Instructions
Create transit_care_instructions table with fields for id (UUID), shopId (UUID for FK to shops), name (varchar for rule name like Summer Heat Protection), temperatureMin and temperatureMax (integer), requiresWatering (boolean), wateringInterval (integer in hours), requiresShade (boolean), packagingInstructions (text), handlingWarnings (text array), isActive (boolean), createdAt, and updatedAt.

---

### Service Layer

#### 4.1 Shipping Configuration Service
Create Shipping Configuration Service at src/modules/shipping/shipping-config.service.ts with methods including createShippingZone (shopId, input) to add delivery zone, updateZone (zoneId, input) to modify zone, deleteZone (zoneId) to remove zone, and getZones (shopId) to get all zones.

Zone configuration includes name (such as Dhaka Metro or Outside Dhaka), districts covered, delivery time estimates, base rates, per-kg rates, and free shipping thresholds.

#### 4.2 Dynamic Shipping Calculator
Create Dynamic Shipping Calculator at src/modules/shipping/shipping-calculator.service.ts with methods including calculateForCart (shopId, cart, address) for all shipping options, applyPlantRules (cartItems) to add special handling fees, calculateTransitTime (rate, destination) for estimated delivery, getCheapestOption (shopId, cart, address) for best rate, and getFastestOption (shopId, cart, address) for quickest delivery.

Calculator considerations include plant size and weight, seasonal weather restrictions, special care requirements, and remote area surcharges.

---

### Database Layer

#### 5.1 Notification Templates
Create notification_templates table with fields for id (UUID), type (enum: email, sms), event (varchar for events like order_placed, order_shipped), channel (varchar for user, seller, admin), subject (varchar for email), body (text template with variables), variables (jsonb for available placeholders), isActive (boolean), locale (varchar for en, bn), createdAt, and updatedAt.

Default templates include email notifications for order_confirmation, order_shipped, order_delivered, order_cancelled, refund_processed, low_stock_alert, and new_review. SMS templates cover order_placed_otp, order_shipped_sms, and delivery_otp.

---

### Service Layer

#### 6.1 Email Service
Create Email Service at src/modules/notification/email.service.ts with methods including sendEmail (to, templateId, variables) to send templated email, sendBulkEmail (recipients, templateId) for batch sending, sendOrderConfirmation (orderId) for order received, sendOrderUpdate (orderId, status) for status change, sendPasswordReset (userId, token) for reset link, and sendWelcomeEmail (userId) for new account.

Email providers supported include SMTP as primary, SendGrid as backup, and SES as backup.

#### 6.2 SMS Service
Create SMS Service at src/modules/notification/sms.service.ts with methods including sendSMS (to, message) for direct SMS, sendTemplatedSMS (to, templateId, variables) for template SMS, sendOTP (phone, purpose) for one-time password, verifyOTP (phone, code) to validate OTP, and sendBulkSMS (recipients) for batch SMS.

SMS providers supported include Twilio, Nexmo, and BulkSMSBD for local coverage.

#### 6.3 Push Notification Service
Create Push Notification Service at src/modules/notification/push.service.ts with methods including sendPush (userId, title, body, data) to send push notification, subscribeToTopic (userId, topic) for topic subscription, and sendTopicNotification (topic, message) for broadcast.

Use cases include order updates, promotions, and low stock alerts for sellers.

#### 6.4 Event Dispatcher
Create Event Dispatcher at src/modules/notification/event-dispatcher.service.ts to handle events including order_created to notify seller and send confirmation, order_status_changed to update buyer, payment_completed to confirm order, payment_failed to alert buyer, refund_created to notify buyer, stock_low and stock_out to alert seller, and review_created to notify seller.

The event flow works as follows: Business action triggers event, event is queued for processing, relevant templates are loaded, message is formatted with data, message is sent via appropriate channel, and delivery status is logged.

---

### Admin Service Layer

#### 7.1 Admin Platform Dashboard
Create Admin Dashboard Service at src/modules/admin/platform-dashboard.service.ts with methods: getPlatformOverview ( ) for real-time stats, getRecentActivity (limit) for activity feed, getSystemHealth ( ) for performance metrics, and getPendingTasks ( ) for items needing attention.

#### 7.2 Admin Seller Management
Create Admin Seller Service at src/modules/admin/seller-admin.service.ts with methods: getAllSellers (filters, pagination), getSellerDetails (sellerId), suspendSeller (sellerId, reason, adminId), activateSeller (sellerId, adminId), sendSellerMessage (sellerId, message, adminId), and getSellerPerformance (sellerId).

#### 7.3 Admin Notification Service
Create Admin Notification Service at src/modules/admin/notification-admin.service.ts with methods: getAllTemplates (filters), createTemplate (input, adminId), updateTemplate (id, input, adminId), deleteTemplate (id), toggleTemplate (id, active), sendBulkNotification (recipients, templateId, variables), testNotification (type, templateId), and getNotificationStatus (templateId).

#### 7.4 Admin User Management
Create Admin User Service at src/modules/admin/user-admin.service.ts with methods: getAllUsers (filters, pagination), getUserDetails (userId), updateUserRole (userId, role, adminId), suspendUser (userId, reason, adminId), activateUser (userId, adminId), and getUserOrderHistory (userId).

#### 7.5 Admin System Configuration
Create Admin Config Service at src/modules/admin/config-admin.service.ts with methods: getConfig (key), updateConfig (key, value, adminId), getAllConfigs ( ), configurePaymentGateway (gateway, credentials, adminId), configureEmailProvider (provider, credentials, adminId), configureSMSProvider (provider, credentials, adminId), and setCommissionRate (rate, adminId).

#### 7.6 Admin Audit Service
Create Admin Audit Service at src/modules/admin/audit-admin.service.ts with methods: logAction (adminId, action, details), getAuditLogs (filters, pagination), searchLogs (query), exportLogs (filters, format), and getSuspiciousActivity (timeframe).

#### 7.7 Admin Reports Service
Create Admin Reports Service at src/modules/admin/reports-admin.service.ts with methods: generatePlatformReport (type, dateRange), getRevenueAnalytics (dateRange), getUserAnalytics (dateRange), getConversionAnalytics (dateRange), and exportReport (format, dateRange).

#### 7.8 Admin Content Service
Create Admin Content Service at src/modules/admin/content-admin.service.ts with methods: getPages ( ), getPage (slug), updatePage (slug, content, adminId), getBanners ( ), createBanner (input, adminId), updateBanner (id, input, adminId), deleteBanner (id), and manageFeaturedCollections (collections).

---

### API Layer

#### 8.1 Admin Resolvers
Create Admin Platform Resolver at src/api/admin/platform-admin.resolver.ts with queries: adminDashboardOverview, adminRecentActivity, adminSystemHealth, and adminPendingTasks.

Create Admin Seller Resolver at src/api/admin/seller-admin.resolver.ts with queries: adminAllSellers, adminSellerDetails, adminSellerPerformance.

Admin seller mutations include adminSuspendSeller, adminActivateSeller, and adminSendSellerMessage.

Create Admin Notification Resolver at src/api/admin/notification-admin.resolver.ts with queries: adminNotificationTemplates, adminNotificationStatus.

Admin mutations include adminCreateTemplate, adminUpdateTemplate, adminDeleteTemplate, adminToggleTemplate, adminSendBulkNotification, and adminTestNotification.

Create Admin User Resolver at src/api/admin/user-admin.resolver.ts with queries: adminAllUsers, adminUserDetails, adminUserOrderHistory.

Admin mutations include adminUpdateUserRole, adminSuspendUser, and adminActivateUser.

Create Admin Config Resolver at src/api/admin/config-admin.resolver.ts with queries: adminConfig and adminAllConfigs.

Admin mutations include adminUpdateConfig, adminConfigurePaymentGateway, adminConfigureEmailProvider, adminConfigureSMSProvider, and adminSetCommissionRate.

Create Admin Audit Resolver at src/api/admin/audit-admin.resolver.ts with queries: adminAuditLogs and adminSuspiciousActivity.

Create Admin Reports Resolver at src/api/admin/reports-admin.resolver.ts with queries: adminPlatformReport, adminRevenueAnalytics, adminUserAnalytics.

Admin mutations include adminExportReport.

Create Admin Content Resolver at src/api/admin/content-admin.resolver.ts with queries: adminPages, adminPage, adminBanners, adminFeaturedCollections.

Admin mutations include adminUpdatePage, adminCreateBanner, adminUpdateBanner, adminDeleteBanner.

---

### Database Layer

#### 9.1 Order Automation Rules
Create order_automation_rules table with fields for id (UUID), shopId (UUID for FK to shops), name (varchar), trigger (enum: payment_received, manual, scheduled), conditions (jsonb for orderTotalMin, orderTotalMax, shippingDistrict, productCategory), actions (jsonb for setStatus, addTag, notifyCustomer, notifySeller), isActive (boolean), createdAt, and updatedAt.

---

#### 9.2 Messaging System
Create conversations table with fields for id (UUID), orderId (UUID for FK to orders), buyerId and sellerId (UUIDs for FK to users), status (enum: open, resolved, closed), createdAt, and updatedAt.

Create messages table with fields for id (UUID), conversationId (UUID), senderId (UUID), content (text), type (enum: text, image, system), isRead (boolean), and createdAt.

---

### Service Layer

#### 10.1 Bulk Order Operations
Create Bulk Order Service at src/modules/order/bulk-order.service.ts with methods including bulkUpdateStatus (orderIds, status) for mass status change, bulkPrintLabels (orderIds) to generate shipping labels, bulkExport (orderIds, format) for CSV or Excel export, and assignToBatch (orderIds, batchId) to group orders.

#### 10.2 Message Service
Create Message Service at src/modules/messaging/message.service.ts with methods including startConversation (orderId, sellerId) to begin chat, sendMessage (conversationId, senderId, content) to send message, markAsRead (conversationId, userId) to update read status, getConversation (conversationId) to fetch messages, and getUserConversations (userId) to get all chats for user.

---

### Service Layer

#### 11.1 Caching Strategy
Create Cache Service at src/modules/cache/cache.service.ts with caching strategy including product listings at 5 minute TTL, product details at 10 minute TTL, category tree at 1 hour TTL, shop profile at 15 minute TTL, and shipping zones at 1 hour TTL.

Cache invalidation rules: Product update invalidates product cache, price change invalidates price cache, stock change invalidates stock cache, and shop update invalidates shop cache.

#### 11.2 Monitoring Service
Create Monitoring Service at src/modules/monitoring/metrics.service.ts with metrics to track including response time by endpoint, error rates, payment success rate, cart abandonment rate, checkout completion rate, and API usage by client.

Tools integration includes APM for Application Performance Monitoring, custom analytics dashboard, and alert thresholds.

---

### Testing

#### 12.1 End-to-End Testing
Create E2E Test Suite covering Full Buyer Journey (browse products, add to cart, checkout with payment, receive confirmation), Full Seller Journey (apply to become seller, create shop, add products, process order, ship order), Admin Journey (approve seller, view orders, handle disputes), and Edge Cases (payment failure, out of stock during checkout, invalid shipping address).

#### 12.2 Load Testing
Create Load Test Scenarios including Homepage load with 1000 concurrent users, Product search with 500 concurrent users, Checkout flow with 100 concurrent users, Payment processing with 50 concurrent users, and Admin operations with 20 concurrent users.

Target metrics include P95 response time under 2 seconds, error rate under 1 percent, and uptime above 99.9 percent.

---

### Launch Preparation

#### 13.1 Launch Checklist
Pre-launch tasks include ensuring all phases are implemented and tested, completing security audit, passing performance tests, testing payment gateway sandbox, testing SMS and email delivery, configuring SEO metadata, generating sitemap, configuring robots.txt, implementing privacy policy, implementing terms of service, and implementing return policy.

Launch day tasks include switching DNS, activating SSL certificate, configuring monitoring alerts, preparing on-call team, and having rollback plan ready.

Post-launch tasks include monitoring error rates, watching payment success, checking inventory sync, and monitoring support tickets.

---

## Implementation Order

Week 1 focuses on Dashboard plus Analytics Services plus Admin Dashboard. Week 2 covers Advanced Shipping Configuration plus Admin Shipping oversight. Week 3 includes Notification System (Email, SMS, Push) plus Admin Notification management. Week 4 addresses Seller Tools (Bulk operations, Messaging) plus Admin Seller management. Week 5 handles Performance plus Caching plus Admin System Configuration. Week 6 is reserved for Testing, Launch Prep, plus Deployment.

---

## Dependencies

The implementation depends on all previous phases (Phase 1-4) being complete, Email provider (SMTP/SendGrid), SMS provider (Twilio/BulkSMSBD), Monitoring tools (Datadog/New Relic), and CDN (Cloudflare).

---

## Success Criteria

Admin dashboard shows real-time platform metrics. Admin can manage all sellers. Admin can manage all users. Admin can view and manage shipping configurations. Admin can manage notification templates. Seller dashboard shows real-time metrics. Sales reports generate correctly. Shipping zones configured per shop. Plant-specific shipping rules work. Transit care instructions display properly. Email notifications send correctly. SMS notifications deliver reliably. Push notifications function. Bulk order operations work. Seller-buyer messaging works. System passes load tests. All security checks passed.
