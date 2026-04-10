# ByteForge Plant Ecommerce Roadmap

## Project Goal
The primary objective of this project is to build a **fully functional, end-to-end multi-vendor ecommerce platform dedicated exclusively to plants**. The platform aims to empower local nursery owners by providing them with "First-Class" branding opportunities and a robust system to manage their unique inventory while facilitating nationwide sales.

> **⚠️ Important: GraphQL is NOT used in this project. All APIs are REST-based.**

---

## Detailed Phase Plans

Each phase has a dedicated execution plan with step-by-step implementation tasks.

**Phase 1 - Shop & Seller Foundation**: [PHASE_1_SHOP_FOUNDATION.md](./PHASE_1_SHOP_FOUNDATION.md) establishes the multi-vendor ecosystem with premium branding, shop profile management, visual customization, seller and admin role separation, and plant taxonomy.

**Phase 2 - Core Catalog (The Plant Model)**: [PHASE_2_CORE_CATALOG.md](./PHASE_2_CORE_CATALOG.md) defines the specialized data structure for live plants including botanical attributes (sunlight, water, pH), growth stage variants (sapling versus mature), and care library integration.

**Phase 3 - Logistics (Inventory & Media)**: [PHASE_3_LOGISTICS.md](./PHASE_3_LOGISTICS.md) implements real-time stock and visual management with nursery stock tracking, optimized high-resolution image gallery for plants, and inventory alerts for sellers.

**Phase 4 - Commerce (Transaction Engine)**: [PHASE_4_COMMERCE.md](./PHASE_4_COMMERCE.md) enables secure nationwide trading through persistent cart with stock validation, local payment integration (bKash/SSLCommerz), and order state machine from PREP to SHIPPED to COMPLETE.

**Phase 5 - Go-Live (Smarter Operations)**: [PHASE_5_GOLIVE.md](./PHASE_5_GOLIVE.md) achieves full operational capacity with seller performance dashboards, shipping config engine with zones and care during transit, and automated notifications via SMS and email.

---

## Scope Definition

### In-Scope (Phase 1-5)
- **Multi-Vendor Architecture**: Allowing users to apply for and manage independent nursery profiles.
- **First-Class Branding**: Providing premium visual customization (logos, cover images, color palettes) and brand storytelling tools for every shop.
- **Specialized Plant Catalog**: A dedicated plant management system that tracks species-specific metadata (sunlight, water, growth stages, care guides).
- **Commerce Lifecycle**: A complete transaction engine including a persistent cart, stock-checked checkout, local payment integration, and order state management.
- **Seller Operations**: Dashboards for tracking sales and performance, paired with a nationwide shipping rate engine.

### Out-of-Scope (Initial Launch)
- **Non-Plant Products**: Pots, seeds, soils, and gardening tools are excluded from the initial "Live" milestone to maintain a clean focus on live plants.
- **Automated Payout Settlements**: Vendor commissions and automated payouts will be handled manually initially and automated in later expansion phases.
- **Advanced Farming Equipment**: Heavy machinery and industrial farming tools are not part of the current gardening/nursery focus.

---

## The "Live" Milestone (Phase 5)

The project is considered "Live" when:
1. Sellers can list specialized plant data (Species, Care Level, Growth Stage).
2. Nationwide shipping configurations are operational.
3. Secure payments (Local gateways) and order lifecycle tracking are complete.

---

## Strategic Phases Summary

**Phase 1: Foundation (Seller Identity & First-Class Branding)** establishes the multi-vendor ecosystem with premium branding through shop profile management, visual customization, seller and admin role separation, and taxonomy for specialized plant categories.

**Phase 2: Core Catalog (The Plant Model)** defines the specialized data structure for live plants with botanical attributes (sunlight, water, pH), growth stage variants (sapling versus mature), and care library integration with links to ByteForge care guides.

**Phase 3: Logistics (Inventory & Media)** enables real-time stock and visual management through nursery stock tracking, optimized high-resolution image gallery for plants, and inventory alerts for sellers.

**Phase 4: Commerce (Transaction Engine)** enables secure nationwide trading with persistent cart and stock validation, local payment integration (bKash/SSLCommerz), and order state machine from PREP through SHIPPED to COMPLETE.

**Phase 5: Go-Live (Smarter Operations)** achieves full operational capacity with seller performance dashboards, shipping config engine with zones and care during transit, and automated notifications via SMS and email.

---

## Future Expansion
- **Pots & Accessories Module**: Independent weight-based management.
- **Seed Lifecycle**: Expiration and germination rate tracking.
- **Vendor Settlement**: Automated payout management.

---

## Verification & Quality
- **Data Integrity**: Continuous validation of care metadata for all listings.
- **Transaction Reliability**: End-to-end testing of the checkout pipeline.
- **Seller UX**: Streamlined onboarding and listing processes.

---

## Implementation Summary

**Phase 1: Shop & Seller Foundation** includes database schema enhancements, REST API types and inputs, shop service with business logic, taxonomy service, public shop pages, guards and permissions, seed data, and testing.

**Phase 2: Core Catalog (The Plant Model)** includes botanical attributes, plant variants for growth stages, care instructions, plant media gallery, search and recommendations, and care library integration.

**Phase 3: Logistics (Inventory & Media)** includes inventory transactions, stock alerts, media processing pipeline, background jobs, and inventory reporting.

**Phase 4: Commerce (Transaction Engine)** includes cart management, order management, payment gateways (bKash, SSLCommerz, COD), shipping configuration, and checkout flow.

**Phase 5: Go-Live (Smarter Operations)** includes seller dashboards, advanced shipping, notifications (email, SMS, push), performance optimization, and launch preparation.
