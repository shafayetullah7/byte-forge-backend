# Phase 3: Logistics (Inventory & Media) - Execution Plan

This plan describes the functional requirements and implementation tasks for real-time stock and visual management.

---

## Overview

The goal of Phase 3 is to implement real-time stock and visual management. The key features include real-time nursery stock tracking, optimized high-resolution image gallery for plants, and inventory alerts for sellers.

---

## Key Features

### Real-Time Nursery Stock Tracking
The system should maintain accurate inventory counts across all warehouse locations. Every stock movement (purchase, sale, adjustment, transfer) should be logged with full audit trail. Stock reservations should prevent overselling during checkout.

### Optimized High-Res Image Gallery
Plants require high-quality images to showcase their beauty. The system should automatically generate multiple image sizes and formats (WebP, AVIF) for optimal loading across all devices. Lazy loading and blur placeholders should enhance the user experience.

### Inventory Alerts for Sellers
Sellers should receive automated notifications when their stock falls below thresholds. Configurable alerts for low stock, out of stock, and overstock situations help sellers maintain optimal inventory levels.

---

## 4. Admin Panel

The admin panel provides comprehensive control over inventory and media management across the platform.

### Inventory Overview
- Admin should be able to view platform-wide inventory summary including total stock value, low stock items count, out of stock items count.
- Admin should be able to view inventory by shop with filtering and sorting.
- Admin should be able to see inventory trends over time.
- Admin should be able to monitor stock movement across all shops.

### Stock Management
- Admin should be able to view any shop's inventory details.
- Admin should be able to adjust stock levels for any shop with reason tracking.
- Admin should be able to transfer stock between locations across shops.
- Admin should be able to view stock transaction history for any product.
- Admin should be able to force override stock reservations.
- Admin should be able to view and manage stock alerts for all shops.

### Media Library Management
- Admin should be able to view platform-wide media library with search and filters.
- Admin should be able to see which media is used where.
- Admin should be able to delete or archive unused media.
- Admin should be able to view media upload statistics.
- Admin should be able to monitor storage usage by shop.

### Media Processing Configuration
- Admin should be able to configure image processing settings including default quality, sizes, and formats.
- Admin should be able to enable or disable specific formats (WebP, AVIF).
- Admin should be able to set thumbnail generation rules.
- Admin should be able to configure CDN settings.

### Alert Configuration
- Admin should be able to set platform-wide default alert thresholds.
- Admin should be able to configure which alert types are enabled.
- Admin should be able to set notification preferences for low stock alerts.
- Admin should be able to view alert history across all shops.

### Analytics and Reporting
- Admin should be able to generate inventory reports across all shops.
- Admin should be able to see which products are frequently out of stock.
- Admin should be able to monitor shipping performance by shop.
- Admin should be able to track media upload and usage patterns.

---

## Detailed Implementation Steps

### Database Layer

#### 1.1 Inventory Management Schemas
Create inventory_transactions table to log all stock movements with fields for id (UUID), variantId (FK to plant_variants), type (enum: purchase, sale, adjustment, transfer, return, damage), quantity (integer positive/negative), referenceId (UUID for order ID or adjustment reason), notes (text), createdBy (UUID for FK to users), and createdAt (timestamp).

Create stock_alerts table for alert configurations with fields for id (UUID), shopId (UUID for FK to shops), variantId (UUID for FK to plant_variants), thresholdType (enum: low_stock, out_of_stock, overstock), thresholdValue (integer), isActive (boolean), notifyEmail (boolean), notifySMS (boolean), lastTriggeredAt (timestamp), createdAt, and updatedAt.

Create inventory_locations table for warehouse management with fields for id (UUID), shopId (UUID for FK to shops), name (varchar for location name like "Main Nursery"), type (enum: nursery, greenhouse, warehouse, storefront), addressId (UUID for FK to shop_addresses), isActive (boolean), createdAt, and updatedAt.

Create inventory_stock table for location-specific stock with fields for id (UUID), locationId (UUID for FK to inventory_locations), variantId (UUID for FK to plant_variants), quantity (integer), reservedQuantity (integer for pending orders), availableQuantity (integer computed), lastCountedAt (timestamp), and updatedAt.

---

#### 1.2 Media Optimization Schemas
Create media_variants table for processed images with fields for id (UUID), originalMediaId (UUID for FK to media), variantType (enum: thumbnail, small, medium, large, webp, avif), width (integer), height (integer), fileSize (integer in bytes), url (varchar), and createdAt.

Create media_optimization_config table for processing rules with fields for id (UUID), mediaType (enum: plant_image, shop_logo, banner), maxWidth (integer), maxHeight (integer), quality (integer 1-100), format (varchar: jpeg, webp, avif), generateThumbnails (boolean), thumbnailSizes (integer array like [150, 300, 600]).

---

### Service Layer

#### 2.1 Stock Management Service
Create Inventory Service at src/modules/inventory/inventory.service.ts with methods for managing stock levels. Key methods include getCurrentStock (variantId) to get current quantity, getStockByLocation (variantId, locationId) to get location-specific stock, adjustStock (variantId, quantity, type, notes) for manual adjustment, transferStock (fromLocation, toLocation, variantId, quantity) to move stock, reserveStock (variantId, quantity) to reserve for order, releaseStock (variantId, quantity) to release reservation, fulfillStock (variantId, quantity) to confirm shipment, and returnStock (variantId, quantity) to handle returns.

Business rules include: Available equals Quantity minus Reserved, cannot reserve more than available stock, multiple reservations aggregate together, and stock goes negative only with explicit override.

#### 2.2 Stock Alert Service
Create Stock Alert Service at src/modules/inventory/stock-alert.service.ts with methods including createAlert (config) to set up notification, updateAlert (id, config) to modify alert, deleteAlert (id) to remove alert, getAlertsByShop (shopId) to get all alerts for shop, checkAndTriggerAlerts ( ) to run daily check job, sendAlertNotification (alert, currentStock) to trigger alerts, and getActiveAlerts (variantId) to get alerts for specific variant.

#### 2.3 Inventory Reporting
Create Inventory Reports Service at src/modules/inventory/inventory-report.service.ts with methods including getStockSummary (shopId) for overview of all stock, getLowStockReport (shopId, threshold) for items below threshold, getOutOfStockReport (shopId) for zero stock items, getStockValueReport (shopId) for total inventory value, getStockMovementReport (shopId, dateRange) for transaction history, getSlowMovingReport (shopId) for items not sold in X days, getReorderSuggestions (shopId) based on sales velocity, and getInventoryTurnover (shopId) for how fast stock moves.

---

### Admin Service Layer

#### 3.1 Admin Inventory Service
Create Admin Inventory Service at src/modules/admin/inventory-admin.service.ts with methods: getPlatformInventorySummary ( ) to get total platform stock stats, getInventoryByShop (shopId, filters) to view shop inventory, adjustStockAsAdmin (shopId, variantId, quantity, reason, adminId) to force adjust, getStockTransactionHistory (variantId) to see all movements, forceReleaseReservations (variantId, adminId) to override reservations, and getLowStockAcrossPlatform (threshold) to see all low stock items.

#### 3.2 Admin Stock Alert Service
Create Admin Stock Alert Service at src/modules/admin/stock-alert-admin.service.ts with methods: getAllAlerts (filters) to see alerts across shops, configurePlatformDefaults (settings) to set default thresholds, getAlertHistory (shopId) to see triggered alerts, and disableAlert (alertId) to turn off alerts.

#### 3.3 Admin Media Service
Create Admin Media Service at src/modules/admin/media-admin.service.ts with methods: getMediaLibrary (filters, pagination) to see all platform media, getMediaUsage (mediaId) to see where media is used, deleteMedia (mediaId, adminId) to remove media, getStorageStats ( ) to see storage by shop, configureProcessingSettings (config) to update processing rules, and regenerateMediaVariants (mediaId) to reprocess.

#### 3.4 Admin Analytics Service
Create Admin Analytics Service at src/modules/admin/inventory-analytics.service.ts with methods: getPlatformStockValue ( ) to get total inventory worth, getStockOutageReport ( ) to find frequently out of stock items, getMediaUploadStats (dateRange) to track uploads, getStorageUsageByShop ( ) to see storage consumption, and generateInventoryReport (filters) for platform-wide report.

---

### API Layer

#### 4.1 Inventory Resolvers
Create Inventory Query Resolver at src/api/inventory/inventory.resolver.ts with queries including inventorySummary (shopId) for stock overview, stockByVariant (variantId) for current stock levels, stockByLocation (locationId) for all stock at location, stockAlerts (shopId) for all configured alerts, inventoryReport (reportType, filters) to generate report, lowStockItems (shopId, threshold) for below threshold items, and outOfStockItems (shopId) for zero stock.

Create Inventory Mutation Resolver with mutations including adjustStock (variantId, quantity, type, notes) for manual adjustment, transferStock (fromLocation, fromVariant, toLocation, toVariant, quantity) for stock transfer, createStockAlert (input) to set up notification, updateStockAlert (id, input) to modify alert, deleteStockAlert (id) to remove alert, and runStockCheck (shopId) to trigger alert check manually.

Admin mutations include adminAdjustStock (variantId, quantity, override) for force adjustment and adminRecalculateStock (variantId) to recompute from transactions.

---

### Admin API Layer

#### 5.1 Admin Inventory Resolvers
Create Admin Inventory Resolver at src/api/admin/inventory-admin.resolver.ts with admin queries: adminPlatformInventorySummary, adminAllShopInventory (shopId), adminStockTransactionHistory (variantId), adminLowStockPlatform (threshold), adminStockAlertHistory (shopId).

Admin mutations include adminAdjustStockForShop, adminForceReleaseStock, adminConfigureAlertDefaults, and adminBulkAlertConfig.

#### 5.2 Admin Media Resolvers
Create Admin Media Resolver at src/api/admin/media-admin.resolver.ts with admin queries: adminMediaLibrary, adminMediaUsage, adminStorageStats, adminProcessingConfig.

Admin mutations include adminDeleteMedia, adminConfigureProcessing, adminRegenerateVariants.

---

### Media Services

#### 6.1 Image Processing Pipeline
Create Media Processing Service at src/modules/media/media-processing.service.ts with methods including processUploadedImage (mediaId) to generate all variants, generateThumbnail (originalId, size) to create thumbnail, optimizeImage (originalId, config) to compress image, convertFormat (originalId, targetFormat) to convert to WebP or AVIF, generateResponsiveSizes (originalId) for all breakpoint versions, and regenerateAllVariants (mediaId) to reprocess from scratch.

The processing workflow follows these steps: Upload original to Cloudinary, trigger onUpload webhook, queue variant generation jobs, generate thumbnail at 150px, generate small at 300px, generate medium at 600px, generate large at 1200px, convert to WebP, convert to AVIF, and finally update media record with variants.

#### 6.2 Media CDN Service
Create Media CDN Service at src/modules/media/cdn.service.ts with methods including getOptimizedUrl (mediaId, options) to get variant URL, getResponsiveUrls (mediaId) for all sizes using picture element, getBlurHash (mediaId) to generate blur placeholder, getLazyLoadUrls (mediaId) for low-quality placeholder plus HD, purgeCache (mediaId) to clear CDN cache, and getCdnStatistics (mediaId) for usage stats.

---

### API Layer

#### 7.1 Media Resolvers
Create Media Query Resolver at src/api/media/media.resolver.ts with queries including mediaById (id: UUID!) for single media item, mediaByIds (ids: [UUID!]!) for multiple items, mediaByEntity (entityType: String!, entityId: UUID!) for entity's media, cdnStats (mediaId: UUID!) for media CDN stats, plantGallery (plantId: UUID!) for plant images, and plantMainImage (plantId: UUID!) for primary image.

Create Media Mutation Resolver with mutations including uploadMedia (input: UploadMediaInput!) for single upload, uploadMediaBatch (input: BatchUploadInput!) for multiple uploads, deleteMedia (id: UUID!) to remove media, updateMediaMetadata (id: UUID!, metadata: JSON!) to update metadata, reprocessMedia (id: UUID!) to regenerate variants, and setMediaPrimary (id: UUID!, entityType: String!, entityId: UUID!) to set as primary.

Shop-specific mutations include uploadShopLogo (shopId: UUID!, file: Upload!) and uploadShopBanner (shopId: UUID!, file: Upload!).

---

### Background Jobs

#### 8.1 Inventory Jobs
Create Inventory Job Scheduler at src/modules/inventory/jobs/inventory.job.ts with jobs including StockAlertJob that runs daily at 6 AM to check all active alerts, compare current stock to thresholds, and send notifications if triggered. StockMovementSyncJob runs hourly to sync pending reservations and clean up expired reservations after 24 hours. StockMovementSyncJob runs weekly to log all current stock levels, flag discrepancies, and generate audit reports. LowStockPredictionJob runs daily to analyze sales velocity, predict when items will go low, and generate reorder suggestions.

---

### Testing

#### 9.1 Unit Tests
Write Inventory Service Tests at src/modules/inventory/__tests__/inventory.service.spec.ts and src/modules/inventory/__tests__/stock-alert.service.spec.ts covering test cases for stock reservation (success, insufficient stock), stock release (returns correct quantity), stock transfer (both locations updated), and alert triggering (threshold crossing).

Write Media Processing Tests at src/modules/media/__tests__/media-processing.service.spec.ts covering test cases for image variant generation, format conversion, responsive size generation, and CDN URL generation.

#### 9.2 Integration Tests
Write Inventory API Tests at src/api/inventory/__tests__/inventory.resolver.spec.ts covering test cases for full stock lifecycle (reserve to fulfill), concurrent reservations, stock alerts trigger correctly, and reports generate accurately.

---

## Implementation Order

Week 1 focuses on Schema Enhancements plus Stock Services. Week 2 covers Stock Alerts plus Reporting plus Jobs. Week 3 includes Media Processing Pipeline. Week 4 addresses Media Resolvers plus CDN Integration. Week 5 handles Admin Panel plus Background Jobs. Week 6 is reserved for Testing plus Documentation plus Bug Fixes.

---

## Dependencies

The implementation depends on Phase 2 (Core Catalog) being complete, Cloudinary (for image processing), Bull/Queue (for background jobs), and Notification service (for alerts).

---

## Success Criteria

Real-time stock tracking per variant and location works correctly. Stock reservations during checkout function properly. Admin can view and manage inventory across all shops. Admin can configure platform-wide alert settings. Automated low stock alerts trigger as expected. Stock movement history is logged completely. Inventory reports are accurate. Images are automatically optimized. Multiple image sizes are generated. Responsive images work for all devices. Background jobs run reliably.
