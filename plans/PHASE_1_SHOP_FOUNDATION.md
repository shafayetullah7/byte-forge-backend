# Phase 1: Shop & Seller Foundation - Execution Plan

This plan describes the functional requirements and modular structure for establishing the nursery ecosystem in ByteForge.

---

## 1. Shop Management Module
This module handles the lifecycle and identity of nurseries on the platform.

### Shop Profile & First-Class Branding
- Any authorized user should be able to apply to become a seller by creating a nursery profile.
- A shop must have a unique, SEO-friendly name that identifies the nursery.
- A shop should have a dedicated description to tell the nursery's story and specialty.
- **Premium Branding Identity**: The platform must provide shops with "First-Class" branding opportunities to stand out.
  - **Visual Customization**: Support for high-quality logos, billboard-style cover images, and curated color palettes that reflect the nursery's vibe.
  - **Featured Highlights**: Shops should be able to highlight their "Star" plants or "Special Collections" directly on their landing page.
  - **Brand Storytelling**: A dedicated space for rich-text storytelling (e.g., the nursery's origin, sustainable practices).
- A shop should maintain contact and social information to help users reach out.

### Shop Status & Governance
- Every new shop should start in a "Pending" state until reviewed for quality.
- Admin should be able to activate a shop to make it visible to the public.
- Admin should be able to suspend or deactivate shops that violate platform rules.
- A shop must be linked to a verified owner who is responsible for the inventory.

---

## 2. Seller Identity & Access Module
This module manages the transition of a regular user into a plant seller.

### Seller Onboarding
- The system should automatically upgrade a user's role to "Seller" once their shop application is initiated.
- Sellers should have a private space to manage their shop details, separate from their buyer profile.
- Access to shop management tools must be strictly guarded to ensure only the owner can make changes.

---

## 3. Plant Taxonomy & Discovery Module
This module sets the global standards for how plants are categorized and described.

### Global Category Management
- Admin should define a global set of plant categories (e.g., Indoor, Succulents, Exotic) that all shops must use.
- Use these categories to ensure nationwide search and filtering work consistently regardless of which shop listed the plant.

### Standardized Plant Attributes
- The system should provide global attribute groups (e.g., Care Level, Sunlight Needs) that help describe plant health.
- Sellers should select from these standardized options to make it easier for buyers to compare plants across different shops.

---

## 4. Public Nursery Identity
- Every shop should have a public page that showcases its branding and unique catalog.
- Users should be able to browse a nursery's specific collection via a dedicated landing page.

---

## 5. Admin Panel

The admin panel provides comprehensive control over the platform's shop and seller ecosystem.

### Shop Management
- Admin should be able to view all shops on the platform with filtering by status (pending, active, suspended).
- Admin should be able to review shop applications by viewing shop details, business information, and verification documents.
- Admin should be able to approve shops by changing status from pending to active.
- Admin should be able to reject shops with reason.
- Admin should be able to suspend active shops for policy violations with suspension reason and duration.
- Admin should be able to permanently deactivate shops that violate terms of service.
- Admin should be able to view shop analytics including total shops, pending applications, and suspension rates.

### Seller Management
- Admin should be able to view all sellers including their profile information and associated shops.
- Admin should be able to upgrade users to seller role manually.
- Admin should be able to view seller performance metrics across all their shops.
- Admin should be able to manage seller permissions and access levels.

### Category Management
- Admin should be able to create new plant categories with name, slug, description, and image.
- Admin should be able to edit existing categories including all metadata.
- Admin should be able to delete categories (with option to reassign products).
- Admin should be able to organize categories in hierarchy (parent/child relationships).
- Admin should be able to set category order for display.
- Admin should be able to activate or deactivate categories visibility.

### Tag and Attribute Management
- Admin should be able to create attribute groups like Care Level, Sunlight, Water Needs.
- Admin should be able to add attributes to groups.
- Admin should be able to set which attributes are required for products.
- Admin should be able to manage tag groups for filtering.

### Platform Settings
- Admin should be able to configure shop creation settings including whether approval is required.
- Admin should be able to set platform-wide branding guidelines.
- Admin should be able to configure default commission rates for shops.

---

## Detailed Implementation Steps

### Database Layer

#### 1.1 Existing Schemas (Already Implemented)
The following database schemas are already in place: shopTable (Core shop entity), businessAccountTable (Business account), managerTable (Shop managers), shopAddressTable (Shop addresses), shopContactTable (Contact info), shopSocialMediaTable (Social links), shopVerificationTable (Verification status), and categoriesTable (Plant categories).

#### 1.2 Required Enhancements
The following enhancements need to be made to the existing schemas:

Add shop status field to track shop lifecycle. Add a 'status' field to shopTable with values PENDING, ACTIVE, SUSPENDED, and DEACTIVATED. Create the ShopStatusEnum and generate a migration file add_shop_status_field.sql.

Add branding palette fields for "First-Class" customization. Include fields for primaryColor, secondaryColor, and accentColor as varchar with hex code values. Create migration add_shop_branding_colors.sql.

Add brand storytelling field. Add 'brandStory' field as text for rich content and 'featuredHighlight' field for highlighting special plants. Create migration add_brand_story_fields.sql.

---

### REST API Schema Layer

#### 2.1 Shop Types & Inputs
Define REST API DTOs in src/api/shop/dto/shop.dto.ts including CreateShopDto for shop creation, UpdateShopDto for updates, ShopBrandingDto for color palette, ShopStatusDto for status changes, and ApplyAsSellerDto for seller application.

#### 2.2 Taxonomy Types & Inputs
Define REST API DTOs in src/api/taxonomy/dto/taxonomy.dto.ts including CategoryDto for category operations and CategoryRelationDto for parent-child relationships.

---

### Service Layer

#### 3.1 Shop Service
Create Shop Service at src/modules/shop/shop.service.ts with the following methods: createShop (ownerId, input) to create new shop with business account, updateShop (shopId, input) to update shop details, updateShopBranding (shopId, branding) to update color palette, getShopById (shopId) to fetch shop by ID, getShopBySlug (slug) to fetch shop by SEO-friendly slug, getShopsByOwner (ownerId) to get all shops owned by user, updateShopStatus (shopId, status) to change shop status, verifyShop (shopId) to mark shop as verified, and suspendShop (shopId) to suspend shop.

Create Shop Business Logic at src/modules/shop/shop.business.service.ts with business rules including: validateShopNameUnique (name, businessAccountId) to ensure unique shop name, validateSellerCanCreateShop (ownerId) to check if user can apply, transitionShopStatus (current, target) to validate status transitions, and generateShopSlug (name) to create SEO-friendly URL slug.

#### 3.2 Seller Service
Create Seller Service at src/modules/seller/seller.service.ts with the following methods: applyAsSeller (userId, shopData) to initiate seller journey, upgradeUserToSeller (userId) to change user role to SELLER, getSellerProfile (userId) to get seller details, getSellerShops (userId) to get all shops for seller, and validateSellerAccess (sellerId, shopId) to ensure ownership.

#### 3.3 Taxonomy Service
Create Category Service at src/modules/taxonomy/category.service.ts with the following methods: createCategory (input) to create new category, updateCategory (id, input) to update category, deleteCategory (id) to soft delete category, getCategoryById (id) to fetch category, getCategoryBySlug (slug) to fetch by URL slug, getAllCategories ( ) to list all active categories, getRootCategories ( ) to get categories without parent, getChildCategories (parentId) to get subcategories, getCategoryTree ( ) to get full hierarchy tree, activateCategory (id) to make category visible, and deactivateCategory (id) to hide category.

Create Tag Group Service at src/modules/taxonomy/tag-group.service.ts with the following methods: createTagGroup (input) to create attribute group, getTagGroupsByCategory (categoryId) to get attributes for category, getAllTagGroups ( ) to list all attribute groups, and linkTagsToGroup (groupId, tagIds) to associate tags.

---

### Admin Service Layer

#### 4.1 Admin Shop Service
Create Admin Shop Service at src/modules/admin/shop-admin.service.ts with methods for admin operations: getAllShops (filters, pagination) to list all shops with status filtering, getShopForReview (shopId) to get full shop details for admin review, approveShop (shopId, adminId) to approve and activate shop, rejectShop (shopId, reason, adminId) to reject with reason, suspendShop (shopId, reason, duration, adminId) to suspend with reason, deactivateShop (shopId, reason, adminId) to permanently deactivate, and getShopStatistics ( ) to get platform-wide shop metrics.

#### 4.2 Admin Category Service
Create Admin Category Service at src/modules/admin/category-admin.service.ts with methods: createCategoryAsAdmin (input, adminId) to create new category, updateCategoryAsAdmin (id, input, adminId) to update any category, deleteCategoryAsAdmin (id, adminId) to delete category, reorderCategories (orderedIds, adminId) to set display order, mergeCategories (sourceId, targetId, adminId) to combine categories, and getCategoryStatistics ( ) to get usage counts.

#### 4.3 Admin Dashboard Service
Create Admin Dashboard Service at src/modules/admin/dashboard.service.ts with methods: getPendingShopsCount ( ) to get count of pending applications, getActiveShopsCount ( ) to get count of active shops, getSuspendedShopsCount ( ) to get count of suspended shops, getShopsByDateRange (startDate, endDate) to get new shops over time, and getCategoryUsageStats ( ) to get product counts per category.

---

### API Layer

#### 5.1 Shop Controllers
Create Shop Query Controller at src/api/shop/shop.controller.ts with endpoints: GET /shops/:id to get shop by ID, GET /shops/slug/:slug to get shop by URL slug, GET /shops/my to get shops for authenticated seller, GET /shops to list shops for admin, and GET /shops/featured to get highlighted shops for homepage.

Create Shop Controller with endpoints: POST /shops to create new shop, PATCH /shops/:id to update shop, PATCH /shops/:id/branding to update colors, POST /shops/apply to start seller journey, PATCH /shops/:id/status to change status for admin, POST /shops/:id/verify to mark as verified for admin, and POST /shops/:id/suspend to suspend shop for admin.

#### 5.2 Taxonomy Controllers
Create Category Controller at src/api/taxonomy/category.controller.ts with endpoints: GET /categories/:id, GET /categories/slug/:slug, GET /categories to list all active categories, GET /categories/root for top-level categories, GET /categories/tree for full hierarchy, and admin endpoints: POST, PUT, DELETE, PATCH for category operations.

#### 5.3 Admin Controllers
Create Admin Shop Controller at src/api/admin/shop-admin.controller.ts with admin endpoints: GET /admin/shops for listing, GET /admin/shops/pending for pending applications, GET /admin/shops/:id for details, GET /admin/shops/stats for statistics.

Admin shop endpoints: POST /admin/shops/:id/approve, POST /admin/shops/:id/reject, POST /admin/shops/:id/suspend, POST /admin/shops/:id/reactivate.

Create Admin Category Controller at src/api/admin/category-admin.controller.ts with admin endpoints: GET /admin/categories for listing, GET /admin/categories/tree for hierarchy, GET /admin/categories/:id for details.

Admin category endpoints: POST /admin/categories, PUT /admin/categories/:id, DELETE /admin/categories/:id, PATCH /admin/categories/reorder, POST /admin/categories/merge.

---

### Public Shop Pages

#### 6.1 Public Shop Profile
Create Public Shop REST endpoints at src/api/shop/public-shop.controller.ts with endpoints: GET /public/shops/:slug to get public shop data.

Define Public Shop Response DTO at src/api/shop/dto/public-shop.response.dto.ts including id, slug, shopName, logo, banner (URLs), about, brandStory, primaryColor, secondaryColor, accentColor, contact (public contact info), socialMedia (public social links), featuredHighlight, categories (linked categories), and createdAt.

**Note: GraphQL is NOT used - all endpoints are REST.**

---

### Guards & Permissions

#### 7.1 Authorization Guards
Create Shop Guards at src/common/guards/shop.guard.ts including IsShopOwnerGuard to verify user owns the shop, IsShopActiveGuard to verify shop is active, CanManageShopGuard to verify can modify shop, and IsVerifiedSellerGuard to verify seller is verified.

Create Role Guard at src/common/guards/role.guard.ts including SellerRoleGuard to verify user has SELLER role and AdminRoleGuard to verify user has ADMIN role.

---

### Seed Data

#### 8.1 Plant Categories Seed
Create Category Seed at src/_db/seeds/category.seed.ts with default categories: Indoor Plants (Flowering Indoor, Foliage Plants, Air Purifying), Outdoor Plants (Garden Flowers, Shrubs & Bushes, Trees), Succulents (Desert Succulents, Tropical Succulents), Exotic Plants, Herbs & Medicinal, and Seasonal Plants.

---

### Testing

#### 9.1 Unit Tests
Write Shop Service Tests at src/modules/shop/__tests__/shop.service.spec.ts and src/modules/shop/__tests__/shop.business.service.spec.ts with test cases covering createShop (success, duplicate name, invalid owner), updateShop (success, partial update), updateShopBranding (color validation), and status transitions (valid and invalid).

Write Taxonomy Service Tests at src/modules/taxonomy/__tests__/category.service.spec.ts with test cases covering createCategory (success, duplicate slug), hierarchy (parent-child relationships), and activate/deactivate (visibility changes).

#### 9.2 Integration Tests
Write Shop API Tests at src/api/shop/__tests__/shop.resolver.spec.ts with test cases covering create shop as authenticated user, update own shop, update other user's shop (should fail), admin status changes, and public shop queries.

---

### Documentation

#### 10.1 API Documentation
Document Shop APIs at docs/api/shop-api.md with sections covering Shop Queries, Shop Mutations, Public Shop, Admin Shop Management, Category Management, Error Codes, and Examples.

---

## Implementation Order

Week 1 focuses on Schema Enhancements plus REST API DTOs. Week 2 covers Shop Service plus Business Logic. Week 3 includes Taxonomy Service plus Controllers. Week 4 addresses Public Shop Pages plus Guards. Week 5 handles Seed Data plus Testing. Week 6 is reserved for Admin Panel Implementation plus Documentation plus Bug Fixes.

---

## Dependencies

The implementation uses REST API (not GraphQL). Drizzle ORM is already configured. Cloudinary integration exists for media. Authentication module is already implemented.

**Note: GraphQL is NOT used in this project. All APIs are REST-based.**

---

## Success Criteria

Users can apply to become sellers. Users can create and manage shops with branding. Admin can review and manage shop applications. Admin can manage categories and attributes. Public can view shop profiles. Categories are properly structured and queryable. All CRUD operations work correctly. Role-based access is enforced. Tests pass for all core functionality.
