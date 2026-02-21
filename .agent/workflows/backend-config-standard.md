---
description: ByteForge backend configuration management and environment variable access rules
---

# ByteForge Backend Configuration Standard

This document defines the strict rules for managing and accessing environment variables in the ByteForge backend services. Antigravity must adhere to these rules for all code generation, refactorings, and configuration updates.

## 1. Centralized Access
- **No Direct `ConfigService` usage**: Environment variables must **NEVER** be accessed directly through `@nestjs/config`'s `ConfigService` in components, controllers, or services.
- **`AppConfigService` as Single Source**: Use the `AppConfigService` (located in `src/common/modules/app-config/`) to access all environment-based properties.
- **Typed Getters**: Every environment variable must have a corresponding typed getter in `AppConfigService`.

## 2. Environment Updates Workflow
When a new environment variable is needed:
1. **Schema Update**: Add the variable to the Zod schema in `src/_config/env.schema.ts` with appropriate validation and coercion.
2. **AppConfigService Update**: Add a typed getter for the new variable in `AppConfigService`.
3. **Template Update**: Add the variable with a sensible default or placeholder to `.env.example`.
4. **Implementation**: Inject `AppConfigService` into your component and use the new getter.

## 3. Comparison (Anti-Patterns)

### ❌ DON'T: Ad-hoc Access
```typescript
// bad practice
constructor(private configService: ConfigService) {}

@Get()
getData() {
  const apiKey = this.configService.get('API_KEY'); // No type safety, prone to typos
  return apiKey;
}
```

### ✅ DO: Typed Access
```typescript
// good practice
constructor(private configService: AppConfigService) {}

@Get()
getData() {
  const apiKey = this.configService.apiKey; // Type-safe, validated at startup
  return apiKey;
}
```

## 4. Validation Rules
- **Startup Validation**: All environment variables are validated at application startup via the `env.schema.ts`.
- **Coercion**: Use `z.coerce.number()` or `z.coerce.boolean()` for non-string variables in the schema.
- **Optional vs Required**: Use `.optional()` in the schema for variables that have defaults defined in the code or are truly optional. Use `getOrThrow()` in `AppConfigService` only for strictly required variables.

## 5. Verification Checklist
Before completing a configuration-related task, Antigravity must check:
1. Is the new variable present in `env.schema.ts`?
2. Is there a typed getter in `AppConfigService` for it?
3. Is it added to `.env.example`?
4. Are all existing uses of `ConfigService.get()` replaced with `AppConfigService` properties in the modified area?
