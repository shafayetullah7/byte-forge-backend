# API Contract Conventions

## Controller Contract
- Controllers are transport adapters, not domain engines.
- Keep route methods focused on:
  - parsing params/query/body DTOs
  - extracting auth user context
  - delegating to service
  - wrapping output with response service

## DTO and Validation
- Prefer zod-backed DTOs (`createZodDto`) for request validation.
- Keep DTO names explicit and feature-scoped (`UpdateXDto`, `FilterXDto`, etc.).
- Do not bypass DTO validation for complex endpoints.

## Response Envelope
- Use shared response service methods for consistency:
  - success
  - paginated
- Keep response payload shape stable for frontend clients.

## Error Mapping
- Use explicit Nest exceptions aligned to failure type:
  - `BadRequestException`
  - `NotFoundException`
  - `UnauthorizedException` / `ForbiddenException`
  - `ConflictException` (or equivalent) for stale concurrency conflicts
- Avoid leaking raw SQL/internal stack details in messages.

## Localization
- User-facing success/failure messages should resolve through i18n keys.
- Keep keys in both `en` and `bn` files.

## Backward Compatibility
- Avoid renaming/removing response fields without migration plan.
- For additive changes, keep old fields intact unless explicitly deprecated.

## Pagination and Filtering
- Prefer typed filter DTOs for list endpoints.
- Keep metadata shape consistent (`page`, `limit`, `total`, etc.) across modules.
