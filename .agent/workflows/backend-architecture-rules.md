---
description: ByteForge Backend Architecture, Pagination, and Validation Rules
---

# Backend Architecture Rules

These rules map boundaries between Controllers, Services, and Repositories, enforcing exact data flow and input validation strategies throughout the backend API.

## 1. DTO & Validation Requirements
- **NestJS-Zod Exclusively:** All incoming requests (Parameters, Queries, Request Bodies) MUST be validated strictly using `nestjs-zod` through proper, dedicated Zod-backed DTO classes. Do not use generic NestJS `class-validator` decorators or loosely typed structures.
- **Module-Scoped DTOs:** Each distinct module must have its DTOs explicitly scoped within the module's localized `dto` folder (e.g., `src/api/admin/admin-taxonomy/categories/dto/...`). Avoid consolidating cross-cutting DTOs into a global `common/dto` folder.
- **Union ID / Slug Resolution:** When supporting dual parameterized lookups, dynamically validate input via `id: z.union([z.string().uuid(), z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)])`.
- **Enforced UUID Constraints:** Use strictly guarded uuid parameters on explicitly targeted relational constraints (e.g. `z.string().uuid()`).

## 2. Repository / Service Separation
- **No Pagination within Repositories:** Logic detailing offset, bounds, and meta-object (`{ data, meta }`) construction should never reside inside Repository classes.
- **Pagination & Querying Inside Services:** For APIs that retrieve records with pagination, all querying and counting MUST be done directly within the Service file using the database client (e.g., `this.db.client.query...` and `this.db.client.select({ total: count() })...`). Services should NOT use Repositories for `findMany()` or `count()` queries when constructing paginated responses.
- **Single Entity Lookup (findOne):** For Single Object resolution, if an entity contains a natural key (e.g., Slug, SKU) along with a UUID, the `findOne` Service API MUST determine the lookup strategy dynamically using `isUuid` (`import { isUuid } from '@/common/utils/is-uuid.util';`). The condition should dynamically switch between `eq(table.id, id)` and `eq(table.slug, id)` or `eq(table.sku, id)` depending on if `isUuid(id)` evaluates to true. If fetching a strictly UUID-only entity using `findOne(id: string)`, manually check `isUuid(id)` and throw a `BadRequestException` if it fails. Fetching should bypass generic repositories directly to `db.client` if soft-deleted relations are joined.
- **Repository Scope:** Repositories should strictly be used for simple CUD (Create, Update, Delete) operations and basic singular lookups that aren't handling pagination meta mapping.

## 3. Standardized Pagination
- **Standard Query DTOs:** All query DTOs for list endpoints MUST extend `PaginationParamsSchema` from `src/common/schemas/pagination.schema.ts`. This ensures consistent `page`, `limit`, `sortBy`, `sortOrder`, and `search` parameters across the API.
- **`paginate` Utility:** Services MUST use the `paginate()` utility from `src/common/utils/pagination.util.ts` to construct the response envelope. This ensures the `meta` object always contains `total`, `page`, `limit`, `totalPages`, `hasNext`, and `hasPrevious` fields.
- **Consistent Envelope:** Every paginated response must return an object with `{ data: T[], meta: PaginationMeta }` structure, where `meta` follows the standard calculation logic.
