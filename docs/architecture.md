# Byte Forge Auth - Architecture Overview

## Top-Level Layers
- **API layer** (`src/api`): controllers + feature services, grouped by actor.
- **Domain/shared layer** (`src/common`): cross-feature guards, shared services, utilities, platform modules.
- **Data layer** (`src/_repositories`): DB queries and persistence orchestration.
- **Schema/infrastructure layer** (`src/_db/drizzle`): schema source, enums, drizzle integration.

## Actor-Oriented API Structure
- `src/api/admin/` - admin-only operations (taxonomy, shops, media, auth, payment methods, etc.)
- `src/api/user/` - authenticated end-user flows:
  - buyer modules (cart, checkout, orders, addresses)
  - seller modules (shop, products/plants, inventory, shipping rates, orders)
  - user auth/profile/password reset
- `src/api/public/` - anonymous/public read endpoints (plants, shops, categories, tags, location, payment methods)

## Request Flow (Typical)
1. Controller receives request and validates DTO.
2. Guards enforce auth/ownership/role constraints.
3. Service executes use-case logic.
4. Repository layer performs DB read/write operations.
5. Response service wraps payload/message.
6. i18n key resolves localized response message.

## Shared System Building Blocks
- Guards:
  - user auth guard
  - admin auth guard
  - seller shop guard
  - email verified and related guards
- Shared services:
  - order transition/inventory and related orchestration
  - logging, hashing, cookie, email, cloudinary
- Eventing:
  - `common/modules/events`

## Data and Persistence
- Drizzle schema files under `src/_db/drizzle/schema/**` are source of truth.
- Repositories under `src/_repositories/**` expose feature-friendly persistence methods.
- Transactions are used in critical multi-step mutations.

## Internationalization
- Message dictionaries:
  - `src/i18n/en/message.json`
  - `src/i18n/bn/message.json`
- Services/controllers should reference keys, not hardcoded human-facing strings.

## Operational Commands (Common)
- Dev: `pnpm start:dev`
- Build: `pnpm build`
- Typecheck: `npx tsc --noEmit --incremental false`
- Lint: `pnpm lint`
- Tests: `pnpm test`, `pnpm test:e2e`

## Boundary Principles
- Controller != business engine
- Service != SQL layer
- Repository != HTTP-aware layer
- Shared common modules should remain reusable and actor-agnostic where possible
