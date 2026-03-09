# Phase 2: Core Catalog (The Plant Model) - Execution Plan

This plan describes the functional requirements and implementation tasks for building the specialized plant data structure.

---

## Overview

The goal of Phase 2 is to define the specialized data structure for live plants. The key features include botanical attributes (Sunlight, Water, pH), growth stage variants (Sapling vs Mature), and Care Library Integration.

---

## Key Features

### Botanical Attributes
The system should support detailed botanical information for each plant including sunlight requirements, water requirements, pH levels, temperature ranges, humidity needs, and toxicity information. This allows buyers to understand exactly what conditions their plants need to thrive.

### Growth Stage Variants
Plants should be manageable at different growth stages including seedling, sapling, juvenile, mature, and flowering. Each variant should track height, width, pot size, and estimated age. This enables sellers to offer plants at different price points based on their maturity.

### Care Library Integration
The system should integrate with a centralized care guide library that provides comprehensive care instructions. Each plant can link to relevant care guides that help buyers maintain their plants properly.

---

## 4. Admin Panel

The admin panel provides comprehensive control over the plant catalog and botanical data.

### Plant Management
- Admin should be able to view all plants on the platform with filtering by shop, category, status.
- Admin should be able to search plants by name, SKU, or scientific name.
- Admin should be able to view any plant's full details including all variants and metadata.
- Admin should be able to edit any plant's information across all shops.
- Admin should be able to delete plants that violate policies.
- Admin should be able to restore accidentally deleted plants.
- Admin should be able to bulk update plant status (activate, archive).
- Admin should be able to feature or unfeature plants for homepage promotion.

### Botanical Data Management
- Admin should be able to define and manage botanical attribute types (sunlight, water, pH).
- Admin should be able to set which attributes are required for plant listings.
- Admin should be able to manage attribute options and values.
- Admin should be able to create standardized care difficulty levels.
- Admin should be able to manage toxicity categories and warnings.

### Care Guide Management
- Admin should be able to create care guides with title, content, and media.
- Admin should be able to edit and update existing care guides.
- Admin should be able to link care guides to plant categories.
- Admin should be able to manage care guide translations.
- Admin should be able to set which guides are featured.

### Catalog Analytics
- Admin should be able to view total plant count across platform.
- Admin should be able to see plants per category distribution.
- Admin should be able to view most popular plants.
- Admin should be able to track plants with missing or incomplete data.
- Admin should be able to monitor plant listing trends over time.

### Quality Control
- Admin should be able to flag plants with incomplete botanical data.
- Admin should be able to request sellers to add missing information.
- Admin should be able to hide plants pending review.
- Admin should be able to approve plants before they go live (if configured).

---

## Detailed Implementation Steps

### Database Layer

#### 1.1 Existing Schemas (Already Implemented)
The following schemas are already in place: plantTable (Core plant entity), plantCareTable (Care instructions), plantVariantTable (Size/variant options), plantPricingTable (Price management), plantInventoryTable (Stock tracking), plantMediaTable (Plant images/gallery), and plantSeoTable (SEO metadata).

#### 1.2 Required Enhancements
Add Growth Stage tracking to plantVariantTable with fields for growthStage (enum: seedling, sapling, juvenile, mature, flowering), heightCm (integer for plant height), widthCm (integer for plant width), potSizeInches (varchar for pot size), and ageMonths (integer for estimated age).

Create a new plantBotanicalAttributes table to store botanical data including plantId (FK to plants), sunlightRequirement (enum: full_sun, partial_sun, partial_shade, full_shade), waterRequirement (enum: low, moderate, high), phRangeMin and phRangeMax (decimal), temperatureMin and temperatureMax (integer in Celsius), humidityRequirement (enum: low, medium, high), toxicity (enum: safe, mildly_toxic, toxic), and toxicityNotes (text).

Add Growth Rate and Lifecycle fields to plantCareTable including growthRate (enum: slow, moderate, fast), lifespan (varchar: annual, perennial), dormancyPeriod (varchar: winter_dormant, year_round), and propagationMethods (text array for seeds, cuttings, division).

Add Care Library Integration fields to plantCareTable including careGuideId (UUID for FK to care guides library), careGuideUrl (varchar for external care guide link), videoTutorialUrl (varchar for YouTube/video link), and specialCareNotes (text).

---

### REST API Schema Layer

#### 2.1 Plant Types & Inputs
Define REST API DTOs in src/api/plant/dto/plant.dto.ts including CreatePlantDto for new plant, UpdatePlantDto for updates, CreateVariantDto for variants, UpdateVariantDto for variant updates, PlantCareDto for care instructions, BotanicalAttributesDto for botanical data, and PlantSearchDto for search filters.

Define REST API DTOs in src/api/care-guide/dto/care-guide.dto.ts including CreateCareGuideDto for new guide, UpdateCareGuideDto for updates.

#### 2.2 Care Guide Types
Define REST API DTOs in src/api/care-guide/dto/care-guide.dto.ts for care guide operations.

---

### Service Layer

#### 3.1 Plant Service
Create Plant Service at src/modules/plant/plant.service.ts with methods for creating, updating, deleting, and querying plants. Key methods include createPlant (shopId, input) to create new plant listing, updatePlant (plantId, input) to update plant details, deletePlant (plantId) to soft delete plant, getPlantById (plantId) to fetch plant with all relations, getPlantBySlug (slug) to fetch by SEO slug, getPlantsByShop (shopId) to get all plants in a shop, getPlantsByCategory (categoryId) to get plants in category, searchPlants (query, filters) to search with filters, getFeaturedPlants ( ) to get featured plants for homepage, myPlants ( ) to get seller's plants, publishPlant (plantId) to change status to active, archivePlant (plantId) to change status to archived, and duplicatePlant (plantId) to clone plant as new draft.

#### 3.2 Plant Variant Service
Create Plant Variant Service at src/modules/plant/plant-variant.service.ts with methods including createVariant (plantId, input) to add size/stage variant, updateVariant (variantId, input) to modify variant, deleteVariant (variantId) to remove variant, getVariantsByPlant (plantId) to get all variants for plant, getVariantById (variantId) to get single variant details, updateStock (variantId, quantity) to adjust stock, reserveStock (variantId, quantity) to reserve for order, and releaseStock (variantId, quantity) to release reservation.

#### 3.3 Plant Care Service
Create Plant Care Service at src/modules/plant/plant-care.service.ts with methods including setCareInstructions (plantId, input) to save care details, updateCareInstructions (plantId, input) to modify care, getCareInstructions (plantId) to fetch care data, linkCareGuide (plantId, guideId) to connect to library, and validateCareData (input) to validate care values.

#### 3.4 Botanical Attributes Service
Create Botanical Attributes Service at src/modules/plant/botanical-attributes.service.ts with methods including setAttributes (plantId, input) to save botanical data, updateAttributes (plantId, input) to modify attributes, getAttributes (plantId) to fetch botanical data, getPlantsByAttribute (attr, value) to filter by attributes, and calculateCompatibility (plantId, environment) to match to user conditions.

#### 3.5 Plant Search Service
Create Search Service at src/modules/plant/plant-search.service.ts with methods including search (input) for full-text search, filterByCategory (categoryId) for category filtering, filterByCareLevel (level) for difficulty filtering, filterByLightRequirement (light) for sunlight filtering, filterByPriceRange (min, max) for price filtering, sortBy (sortBy, order) for sorting options, and getRecommendations (userId) for personalized suggestions.

---

### Admin Service Layer

#### 4.1 Admin Plant Service
Create Admin Plant Service at src/modules/admin/plant-admin.service.ts with methods: getAllPlants (filters, pagination) to list all plants platform-wide, getPlantForAdmin (plantId) to get full plant details for review, updatePlantAsAdmin (plantId, input) to modify any plant, deletePlantAsAdmin (plantId) to hard delete, restorePlant (plantId) to restore soft-deleted, bulkUpdateStatus (plantIds, status) to activate or archive multiple, featurePlant (plantId, featured) to toggle featured status, and getPlantAnalytics ( ) to get platform-wide plant statistics.

#### 4.2 Admin Botanical Attributes Service
Create Admin Botanical Attributes Service at src/modules/admin/botanical-attributes-admin.service.ts with methods: createAttributeType (input) to define new attribute, updateAttributeType (id, input) to modify attribute, deleteAttributeType (id) to remove attribute, getAllAttributeTypes ( ) to list all, setRequiredAttributes (attributeIds) to mark required, and getAttributeUsageStats ( ) to see which attributes are used.

#### 4.3 Admin Care Guide Service
Create Admin Care Guide Service at src/modules/admin/care-guide-admin.service.ts with methods: createCareGuide (input, adminId) to add new guide, updateCareGuide (id, input, adminId) to modify guide, deleteCareGuide (id) to remove guide, getCareGuideAnalytics ( ) to track guide usage, linkGuideToCategory (guideId, categoryId) to associate with category, and featureCareGuide (id, featured) to highlight guide.

---

### REST API Controllers

#### 5.1 Plant Controllers
Create Plant Controller at src/api/plant/plant.controller.ts with endpoints: GET /plants/:id to get plant by ID, GET /plants/slug/:slug to get by URL slug, GET /plants to list plants with filters and pagination, GET /plants/shop/:shopId to get shop's plants, GET /plants/category/:categoryId to get category plants, GET /plants/featured to get featured plants, GET /plants/search to search plants, and GET /plants/my to get seller's plants.

Create Plant Controller with endpoints: POST /plants to create new plant, PUT /plants/:id to update plant, DELETE /plants/:id to delete plant, PATCH /plants/:id/publish to change status to active, PATCH /plants/:id/archive to change status to archived, POST /plants/:id/duplicate to clone plant, and PATCH /plants/:id/featured to toggle featured status.

Variant endpoints: POST /plants/:id/variants, PUT /variants/:id, DELETE /variants/:id.

Care endpoints: POST /plants/:id/care, PUT /plants/:id/care.

Attributes endpoints: POST /plants/:id/attributes, PUT /plants/:id/attributes.

#### 5.2 Admin Plant Controllers
Create Admin Plant Controller at src/api/admin/admin-plant.controller.ts with admin endpoints: GET /admin/plants to list all plants, GET /admin/plants/:id for details, GET /admin/plants/analytics for statistics, PUT /admin/plants/:id to update any plant, DELETE /admin/plants/:id to hard delete, POST /admin/plants/:id/restore to restore, PATCH /admin/plants/bulk-status for bulk updates, and PATCH /admin/plants/:id/featured to toggle featured.

#### 5.3 Admin Care Guide Controllers
Create Admin Care Guide Controller at src/api/admin/admin-care-guide.controller.ts with admin endpoints: GET /admin/care-guides to list guides, GET /admin/care-guides/:id for details, POST /admin/care-guides to create guide, PUT /admin/care-guides/:id to update guide, DELETE /admin/care-guides/:id to delete guide, and PATCH /admin/care-guides/:id/featured to toggle featured.

---

### Plant Media Management

#### 6.1 Image Gallery
Create Plant Media Service at src/modules/plant/plant-media.service.ts with methods including addImages (plantId, mediaIds) to attach images to plant, removeImage (plantId, mediaId) to detach image, setMainImage (plantId, mediaId) to set primary image, reorderImages (plantId, orderedIds) to change display order, and getGallery (plantId) to get all plant images.

Create Media Upload Controller at src/api/plant/media.controller.ts with endpoints: POST /plants/:id/images to upload images, DELETE /images/:id to remove image, PATCH /images/:id/main to set as primary, and PATCH /plants/:id/images/reorder to reorder gallery.

---

### Care Library Integration

#### 7.1 Care Guides
Create Care Guide Schema as a new table with fields for id (UUID), slug (varchar for unique URL), title (varchar), content (text in markdown), plantType (varchar for general type), difficulty (enum), imageId (UUID for FK to media), videoUrl (varchar), createdAt, and updatedAt.

Create Care Guide Service at src/modules/care-guide/care-guide.service.ts with methods including createGuide (input) to add care guide, getGuideById (id) to fetch guide, getGuideBySlug (slug) to fetch by URL, getGuidesByType (plantType) to get type-specific guides, linkToPlant (plantId, guideId) to connect guide to plant, and getLinkedGuide (plantId) to fetch plant's guide.

---

### Advanced Plant Features

#### 8.1 Plant Comparison
Create Comparison Service at src/modules/plant/plant-comparison.service.ts with methods including comparePlants (plantIds) to get side-by-side data, getComparisonAttributes ( ) to get all comparable fields, and generateComparisonTable (plants) to format for display.

#### 8.2 Plant Recommendations
Create Recommendation Engine at src/modules/plant/plant-recommendation.service.ts with methods including getSimilarPlants (plantId, limit) to get visually similar plants, getByEnvironment (userEnv) to match to conditions, getCareLevelPlants (level) to get all plants at difficulty, getBeginnerFriendly ( ) to get easy-care plants, and getPetSafePlants ( ) to get non-toxic plants.

---

### Testing

#### 9.1 Unit Tests
Write Plant Service Tests at src/modules/plant/__tests__/plant.service.spec.ts and src/modules/plant/__tests__/plant-variant.service.spec.ts covering test cases for createPlant (success, validation errors), updatePlant (partial updates), variant management (CRUD operations), and stock reservation (concurrent updates).

Write Search Tests at src/modules/plant/__tests__/plant-search.service.spec.ts covering test cases for search returns correct results, filters work correctly, sorting works correctly, and pagination is accurate.

#### 9.2 Integration Tests
Write Plant API Tests at src/api/plant/__tests__/plant.controller.spec.ts covering test cases for full plant CRUD lifecycle, variant creation and management, image gallery operations, and search and filtering.

---

## Implementation Order

Week 1 focuses on Schema Enhancements plus REST API DTOs. Week 2 covers Plant Service plus Variant Service. Week 3 includes Care plus Botanical Services plus Controllers. Week 4 addresses Media Management plus Care Library. Week 5 handles Search plus Recommendations plus Comparison. Week 6 is reserved for Admin Panel plus Testing plus Bug Fixes.

---

## Dependencies

The implementation depends on Phase 1 (Shop Foundation) being complete, REST API (to be configured), Media/Cloudinary (for image uploads), and Search infrastructure (Elasticsearch or PostgreSQL full-text).

---

## Success Criteria

Plants can be created with full botanical data. Multiple variants (sizes/growth stages) per plant are supported. Care instructions are comprehensive and structured. Admin can manage all plant data across platform. Admin can manage botanical attributes and care guides. Plants are searchable and filterable. Plants can be compared side-by-side. Recommendations based on user preferences work correctly. Media gallery functions for plant images. Care guides can be linked to plants.
