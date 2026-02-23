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
- **No Pagination within Repositories:** Logic detailing offset, bounds, and meta-object (`{ data, meta }`) construction should never reside inside Repository classes. Repositories must uniquely map queries and cleanly map execution streams onto raw structural arrays (`Entity[]`).
- **Pagination Inside Services:** Services manage formatting. Services calculate the target limits, invoke `findMany()` across the Repository mapping purely for raw item Arrays, simultaneously call `count()` inside the Repository, and construct the paginated response envelope `({ data, meta: { total, page, limit } })`.
