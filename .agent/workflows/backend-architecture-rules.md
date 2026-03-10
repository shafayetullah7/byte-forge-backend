---
description: ByteForge Backend Architecture, Pagination, and Validation Rules
---

# Backend Architecture Rules

These rules map boundaries between Controllers, Services, and Repositories, enforcing exact data flow and input validation strategies throughout the backend API.

## 0. AI Assistant Strict Rules (CRITICAL)
- **No Unsolicited Refactoring:** Do NOT arbitrarily refactor working code (e.g., rewriting raw SQL to ORM syntax or replacing existing mapping logic) unless explicitly instructed by the user. Fix the exact bug requested and touch nothing else.
- **Strict Schema Typing:** Never use inline or implicit types for database operations (e.g., `{ tagId: string, locale: string }[]`). You MUST open the relevant `schema.ts` file, import the exact generated type (e.g., `TNewTagTranslation`, `TCategory`), and strictly use it.

## 1. DTO & Validation Requirements
- **NestJS-Zod Exclusively:** All incoming requests (Parameters, Queries, Request Bodies) MUST be validated strictly using `nestjs-zod` through proper, dedicated Zod-backed DTO classes. Do not use generic NestJS `class-validator` decorators or loosely typed structures.
- **Module-Scoped DTOs:** Each distinct module must have its DTOs explicitly scoped within the module's localized `dto` folder (e.g., `src/api/admin/admin-taxonomy/categories/dto/...`). Avoid consolidating cross-cutting DTOs into a global `common/dto` folder.
- **Union ID / Slug Resolution:** When supporting dual parameterized lookups, dynamically validate input via `id: z.union([z.string().uuid(), z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)])`.
- **Enforced UUID Constraints:** Use strictly guarded uuid parameters on explicitly targeted relational constraints (e.g. `z.string().uuid()`).
- **Strict Parameter/Query Validation:** EVERY incoming data point (Param, Query, Body) MUST have its own Zod DTO. Avoid raw primitive types like `@Param('id') id: string`.

## 2. Repository / Service Separation
- **No Pagination within Repositories:** Logic detailing offset, bounds, and meta-object (`{ data, meta }`) construction should never reside inside Repository classes.
- **Pagination & Querying Inside Services:** For APIs that retrieve records with pagination, all querying and counting MUST be done directly within the Service file using the database client (e.g., `this.db.client.query...` and `this.db.client.select({ total: count() })...`). Services should NOT use Repositories for `findMany()` or `count()` queries when constructing paginated responses.
- **Single Entity Lookup (findOne):** For Single Object resolution, if an entity contains a natural key (e.g., Slug, SKU) along with a UUID, the `findOne` Service API MUST determine the lookup strategy dynamically using `isUuid` (`import { isUuid } from '@/common/utils/is-uuid.util';`). The condition should dynamically switch between `eq(table.id, id)` and `eq(table.slug, id)` or `eq(table.sku, id)` depending on if `isUuid(id)` evaluates to true. If fetching a strictly UUID-only entity using `findOne(id: string)`, manually check `isUuid(id)` and throw a `BadRequestException` if it fails. Fetching should bypass generic repositories directly to `db.client` if soft-deleted relations are joined.
- **Repository Scope:** Repositories should strictly be used for simple CUD (Create, Update, Delete) operations and basic singular lookups that aren't handling pagination meta mapping.

## 3. Standardized Pagination
- **Standard Query DTOs:** All query DTOs for list endpoints MUST extend `PaginationParamsSchema` from `src/common/schemas/pagination.schema.ts`. This ensures consistent `page`, `limit`, `sortBy`, `sortOrder`, and `search` parameters across the API.
- **`paginate` Utility:** Services MUST use the `paginate()` utility from `src/common/utils/pagination.util.ts` to construct the response envelope. This ensures the `meta` object always contains `total`, `page`, `limit`, `totalPages`, `hasNext`, and `hasPrevious` fields.
- **Consistent Envelope:** Every paginated response must return an object with `{ data: T[], meta: PaginationMeta }` structure, where `meta` follows the standard calculation logic.

## 4. Deletion Patterns
- **Soft-Deletion & Unique Constraints:** When softly deleting an entity that has unique constraints (like `slug`), you MUST append a timestamp to the unique field (e.g., `slug: \`deleted_${Date.now()}_${entity.slug}\``) to free up the slug for future use and prevent `Unique Constraint Violations` upon recreation.
- **Orphan Cleanup:** Before soft-deletion, you must hard-delete any closely bound sidecar data (like translations or orphaned metadata) to prevent database bloat, because soft-deleting the parent will bypass relational `CASCADE` deletions.
- **Usage Validation:** Hard validate relationships before deletion and aggressively throw a `BadRequestException` if the entity is currently being used by active products or unrelated domains.

## 5. Internationalization (i18n) & Content Validation
- **Mandatory Bilingual Content**: Every translatable entity MUST have translations for both English (`en`) and Bengali (`bn`). 
- **DTO Enforcement**: Zod-backed DTOs for create/update operations MUST strictly validate that the `translations` array contains exactly these two locales. Missing or extra locales should trigger a validation error.
- **API Specific Errors**:
    - **Admin APIs**: Error messages should be in **plain English** only.
    - **Public/User APIs**: Error messages should support bilingualism (`en`/`bn`).
- **Multilingual Zod Messages**: All validation messages in Zod DTOs for Public/User APIs MUST use translation keys from `message.json` (e.g., `.min(5, { message: 'message.validation.minLength' })`).
- **Bilingual Validation Feedback**: For Admin content-related validation (e.g., "Bengali name is required"), error messages MUST clearly specify which locale is failing, but the message itself is in English.
- **Dynamic Retrieval**: All public-facing and admin APIs must return all available translations to ensure data completeness across all supported languages.

### Multilingual DTO Validation Example
```typescript
const TranslationSchema = z.object({
  locale: z.enum(['en', 'bn']),
  name: z.string().trim().min(1, 'Name is required'),
});

const CreateDtoSchema = z.object({
  translations: z.array(TranslationSchema)
    .min(2, 'Translations for both English and Bengali are required')
    .superRefine((val, ctx) => {
      const locales = val.map(t => t.locale);
      if (!locales.includes('en')) ctx.addIssue({ code: 'custom', message: 'English translation missing' });
      if (!locales.includes('bn')) ctx.addIssue({ code: 'custom', message: 'Bengali translation missing' });
    }),
});
```
