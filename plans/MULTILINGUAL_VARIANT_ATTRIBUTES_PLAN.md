# Multilingual Variant Attributes Implementation Plan

## Overview

This plan addresses multilingual support for plant variant attributes in the byte-forge-auth project. The solution uses a **canonical values + translation table** approach to maintain database filtering capabilities while supporting multiple languages.

## Architectural Pattern: English-as-Default (Special Case)

**Important:** This is a special case pattern that differs from the standard translation approach used in plants, categories, tags, and shops.

| Aspect | Standard Pattern (Plant/Category/Tag/Shop) | Special Pattern (Variant-like Entities) |
|--------|-------------------------------------------|----------------------------------------|
| Main table | Non-localized data only | English values (default locale) |
| Translation table | All locales including English | Non-English locales only |
| FK to languages | Yes, for all translations | Yes, for non-English only |
| Code enforcement | Standard CRUD | Special handling for English fallback |

**Rationale:** For entities like variants where string attributes serve dual purposes (filtering + display), storing English in the main table:
1. Simplifies queries for English (most common locale)
2. Keeps filtering performant (no join needed for canonical values)
3. Reduces data duplication (no English row in translation table)

**This pattern should be applied consistently to similar entities in the future** (e.g., product options, attribute values, etc.) to maintain coherence across the codebase.

---

## Current State Analysis

### Reviewed Schemas

1. **[`plant.schema.ts`](src/_db/drizzle/schema/plant/plant.schema.ts)** - Main plant table with relation to translations
2. **[`plant-translation.schema.ts`](src/_db/drizzle/schema/plant/plant-translation.schema.ts)** - Plant-level translations (name, description)
3. **[`plant-variant.schema.ts`](src/_db/drizzle/schema/plant/plant-variant.schema.ts)** - Variant table with string attributes
4. **[`language.schema.ts`](src/_db/drizzle/schema/i18n/language.schema.ts)** - Language registry table

### Identified Issues

| Issue | Severity | File |
|-------|----------|------|
| Missing FK reference to `languagesTable` for `locale` field | HIGH | [`plant-translation.schema.ts:12`](src/_db/drizzle/schema/plant/plant-translation.schema.ts:12) |
| Missing `language` relation in `plantTranslationsRelations` | MEDIUM | [`plant-translation.schema.ts:25`](src/_db/drizzle/schema/plant/plant-translation.schema.ts:25) |
| No translation support for variant string attributes | HIGH | [`plant-variant.schema.ts`](src/_db/drizzle/schema/plant/plant-variant.schema.ts) |
| Inconsistent unique constraint pattern | LOW | [`plant-translation.schema.ts:18`](src/_db/drizzle/schema/plant/plant-translation.schema.ts:18) |

---

## Architecture Decision: Canonical Values + Translation Table

### Design Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│                     plant_variants (main table)                  │
│  ┌─────────────┬──────────────────────────────────────────────┐ │
│  │ Field       │ Purpose                                      │ │
│  ├─────────────┼──────────────────────────────────────────────┤ │
│  │ id          │ UUID primary key                             │ │
│  │ plantId     │ FK to plants                                 │ │
│  │ name        │ Canonical variant name (e.g., "small")       │ │
│  │ sku         │ Stock keeping unit (non-localized)           │ │
│  │ growthStage │ Canonical value (e.g., "seedling")           │ │
│  │ ...         │ Other canonical string attributes            │ │
│  │ price       │ Integer cents (non-localized)                │ │
│  └─────────────┴──────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1:many
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              plant_variant_translations (translation table)      │
│  ┌─────────────┬──────────────────────────────────────────────┐ │
│  │ Field       │ Purpose                                      │ │
│  ├─────────────┼──────────────────────────────────────────────┤ │
│  │ id          │ UUID primary key                             │ │
│  │ variantId   │ FK to plant_variants                         │ │
│  │ locale      │ FK to languages.code                         │ │
│  │ name        │ Display label (e.g., "ছোট টব")              │ │
│  │ growthStage │ Display label (e.g., "চারা গাছ")             │ │
│  │ ...         │ Other translated display labels              │ │
│  └─────────────┴──────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow Example

```typescript
// Main table (English default + filtering)
{
  id: 'uuid-1',
  plantId: 'uuid-plant',
  name: 'small',           // English: "small"
  growthStage: 'seedling', // English: "seedling"
  price: 1500,             // 15.00 USD
}

// Translation table (non-English locales only)
{
  id: 'uuid-t1',
  variantId: 'uuid-1',
  locale: 'bn',
  name: 'ছোট টব',           // Bengali display
  growthStage: 'চারা গাছ',   // Bengali display
}

// Frontend query
// Filter: WHERE growthStage = 'seedling' (works in any locale)
// Display:
//   - If locale === 'en': use main table value → "seedling"
//   - If locale === 'bn': use translation → "চারা গাছ"
```

### Translation Selection Logic

```typescript
/**
 * Get display value for a variant attribute.
 * Uses English from main table as default, translations for other locales.
 */
function getDisplayValue<T extends keyof VariantTranslations>(
  variant: TPlantVariant,
  translations: TPlantVariantTranslation | null,
  field: T,
  locale: string
): string {
  // For English or missing translations, use main table (English default)
  if (locale === 'en' || !translations) {
    return variant[field] as string;
  }
  
  // For other locales with translations, use translated value
  return translations[field] ?? variant[field] as string; // fallback
}
```

---

## Canonical Value Lists

### Recommended Enumerations

These canonical values should be documented and potentially enforced via PostgreSQL CHECK constraints or TypeScript enums.

#### `growthStage`
```typescript
const GROWTH_STAGES = {
  SEEDLING: 'seedling',      // চারা / Seedling
  YOUNG: 'young',            // অল্প বয়স্ক / Young plant
  MATURE: 'mature',          // পূর্ণ বয়স্ক / Mature
  FLOWERING: 'flowering',    // ফুলে ফোটা / Flowering
  FRUITING: 'fruiting',      // ফল ধরা / Fruiting
  ESTABLISHED: 'established',// প্রতিষ্ঠিত / Established
} as const;
```

#### `propagationType`
```typescript
const PROPAGATION_TYPES = {
  CUTTING: 'cutting',        // কাটিং / Cutting
  SEED: 'seed',              // বীজ / Seed
  DIVISION: 'division',      // বিভাজন / Division
  LAYERING: 'layering',      // লেয়ারিং / Layering
  GRAFTING: 'grafting',      // গ্রাফটিং / Grafting
  BULB: 'bulb',              // বাল্ব / Bulb
  RHIZOME: 'rhizome',        // রাইজোম / Rhizome
} as const;
```

#### `plantForm`
```typescript
const PLANT_FORMS = {
  UPRIGHT: 'upright',        // খাড়া / Upright
  TRAILING: 'trailing',      // লতানো / Trailing
  CLIMBING: 'climbing',      // আরোহী / Climbing
  BUSHY: 'bushy',            // ঝোপালো / Bushy
  SPREADING: 'spreading',    // ছড়ানো / Spreading
  COMPACT: 'compact',        // ছোট / Compact
  ROSETTE: 'rosette',        // রোজেট / Rosette
} as const;
```

#### `variegation`
```typescript
const VARIEGATION_TYPES = {
  SOLID: 'solid',            // একরঙা / Solid
  VARIEGATED: 'variegated',  // বর্ণিল / Variegated
  MOTTLED: 'mottled',        // ছিটকানো / Mottled
  MARGINED: 'margined',      // প্রান্তিক / Margined
  CENTERED: 'centered',      // কেন্দ্রিক / Centered
} as const;
```

#### `containerType`
```typescript
const CONTAINER_TYPES = {
  NURSERY_POT: 'nursery_pot',     // নার্সারি পট
  DECORATIVE_POT: 'decorative_pot', // সজ্জিত টব
  HANGING_BASKET: 'hanging_basket', // ঝুলন্ত ঝুড়ি
  TERRARIUM: 'terrarium',         // টেরারিয়াম
  BARE_ROOT: 'bare_root',         // শিকড় ছাড়া
} as const;
```

#### `bundleType`
```typescript
const BUNDLE_TYPES = {
  SINGLE: 'single',           // একক / Single
  PAIR: 'pair',               // জোড়া / Pair
  SET_OF_3: 'set_of_3',       // ৩টির সেট
  SET_OF_5: 'set_of_5',       // ৫টির সেট
  COLLECTION: 'collection',   // সংগ্রহ / Collection
} as const;
```

---

## Implementation Tasks

### Task 1: Fix plant_translations Schema

**File:** [`src/_db/drizzle/schema/plant/plant-translation.schema.ts`](src/_db/drizzle/schema/plant/plant-translation.schema.ts)

**Changes:**
1. Add FK reference to `languagesTable` for `locale` field
2. Add `language` relation to `plantTranslationsRelations`
3. Update unique constraint to match project pattern

### Task 2: Create plant_variant_translations Schema

**File:** `src/_db/drizzle/schema/plant/plant-variant-translation.schema.ts` (new)

**Schema:**
```typescript
export const plantVariantTranslationsTable = pgTable(
  'plant_variant_translations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    variantId: uuid('variant_id')
      .notNull()
      .references(() => plantVariantTable.id, { onDelete: 'cascade' }),
    locale: varchar('locale', { length: 10 })
      .notNull()
      .references(() => languagesTable.code),
    
    // Translated display labels
    name: varchar('name', { length: 255 }),
    growthStage: varchar('growth_stage', { length: 50 }),
    propagationType: varchar('propagation_type', { length: 50 }),
    plantForm: varchar('plant_form', { length: 50 }),
    variegation: varchar('variegation', { length: 50 }),
    containerType: varchar('container_type', { length: 50 }),
    bundleType: varchar('bundle_type', { length: 50 }),
    // Note: potSize remains in main table as it's often numeric+unit
  },
  (t) => [unique().on(t.variantId, t.locale)]
);

export const plantVariantTranslationsRelations = relations(
  plantVariantTranslationsTable,
  ({ one }) => ({
    variant: one(plantVariantTable, {
      fields: [plantVariantTranslationsTable.variantId],
      references: [plantVariantTable.id],
    }),
    language: one(languagesTable, {
      fields: [plantVariantTranslationsTable.locale],
      references: [languagesTable.code],
    }),
  })
);
```

### Task 3: Update plant-variant.schema.ts

**File:** [`src/_db/drizzle/schema/plant/plant-variant.schema.ts`](src/_db/drizzle/schema/plant/plant-variant.schema.ts)

**Changes:**
1. Add relation to `plantVariantTranslationsTable`
2. Add JSDoc comments clarifying canonical value purpose
3. Consider adding CHECK constraints for canonical values

### Task 4: Update plant/index.ts

**File:** [`src/_db/drizzle/schema/plant/index.ts`](src/_db/drizzle/schema/plant/index.ts)

**Changes:**
1. Export new `plantVariantTranslationsTable`
2. Export types and relations

### Task 5: Create Migration

**File:** `src/_db/drizzle/migrations/0047_multilingual_variants.sql` (new)

**Migration Steps:**
1. Create `plant_variant_translations` table
2. Add FK constraints
3. Add unique index on `(variant_id, locale)`
4. Optional: Migrate existing data (copy current values as 'en' default)

### Task 6: Update TypeScript Types

**File:** `src/_db/drizzle/schema/plant/plant-variant-translation.schema.ts`

**Exports:**
```typescript
export type TPlantVariantTranslation = typeof plantVariantTranslationsTable.$inferSelect;
export type TNewPlantVariantTranslation = typeof plantVariantTranslationsTable.$inferInsert;
```

---

## Migration Strategy

### Phase 1: Schema Changes (Non-breaking)
1. Create new translation table
2. Keep existing `plant_variants` structure unchanged
3. Existing queries continue to work

### Phase 2: Data Migration
```sql
-- Copy existing values as English defaults
INSERT INTO plant_variant_translations (variant_id, locale, name, growth_stage, ...)
SELECT id, 'en', name, growth_stage, ...
FROM plant_variants;
```

### Phase 3: Application Updates
1. Update repositories to join translations when needed
2. Add locale parameter to variant queries
3. Update DTOs to accept locale for variants

## Coding-Level Enforcement Patterns

### Translation Selection (Read)

```typescript
// Service layer pattern
async getVariantWithTranslations(variantId: string, locale: string) {
  const variant = await this.db.query.plantVariantTable.findFirst({
    where: eq(plantVariantTable.id, variantId),
    with: {
      translations: {
        where: eq(plantVariantTranslationsTable.locale, locale),
      },
    },
  });

  if (!variant) throw new NotFoundException();

  // For English, return main table values directly
  if (locale === 'en') {
    return this.toVariantResponse(variant, null);
  }

  // For other locales, merge with translations (fallback to English)
  const translation = variant.translations?.[0] ?? null;
  return this.toVariantResponse(variant, translation);
}

private toVariantResponse(
  variant: TPlantVariant,
  translation: TPlantVariantTranslation | null
) {
  return {
    id: variant.id,
    // Use translation if available, otherwise use English (main table)
    name: translation?.name ?? variant.name,
    growthStage: translation?.growthStage ?? variant.growthStage,
    // ... other fields
  };
}
```

### Translation Insertion (Write)

```typescript
// Service layer pattern
async createVariant(data: CreateVariantDto, locale: string) {
  // For English, insert only into main table
  if (locale === 'en') {
    return this.db.insert(plantVariantTable).values({
      ...data,
      // data contains English values
    });
  }

  // For other locales:
  // 1. Check if English base variant exists (required)
  // 2. Insert into main table with English values
  // 3. Insert into translation table with locale values
  return this.db.transaction(async (tx) => {
    const [variant] = await tx.insert(plantVariantTable).values({
      name: data.englishName,      // Must provide English base
      growthStage: data.englishGrowthStage,
      // ... other English values
    }).returning();

    await tx.insert(plantVariantTranslationsTable).values({
      variantId: variant.id,
      locale,
      name: data.name,             // Translated values
      growthStage: data.growthStage,
      // ... other translated values
    });

    return variant;
  });
}
```

### Translation Prevention (Validation)

```typescript
// DTO validation pattern
export class CreateVariantTranslationDto {
  @IsNotEmpty()
  variantId: string;

  @IsNotEmpty()
  @IsNotIn(['en']) // Prevent English translations (stored in main table)
  locale: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  growthStage?: string;

  // ... other translatable fields
}

// Guard to prevent accidental English insertion
@Injectable()
export class PreventEnglishTranslationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const { locale } = request.body;
    
    if (locale === 'en') {
      throw new BadRequestException(
        'English translations are not allowed. English values must be stored in the main table.'
      );
    }
    
    return true;
  }
}
```

### Repository Pattern for Coherence

```typescript
// Base repository pattern for all "English-as-default" entities
export abstract class TranslatableEntityRepository<
  TMainTable extends Table,
  TTranslationTable extends Table,
  TMainEntity,
  TTranslationEntity
> {
  /**
   * Get display value, using English from main table as default.
   * Override this method for entity-specific logic.
   */
  protected getDisplayValue<T extends keyof TTranslationEntity>(
    mainEntity: TMainEntity,
    translation: TTranslationEntity | null,
    field: T,
    locale: string
  ): string {
    if (locale === 'en' || !translation) {
      return (mainEntity as any)[field] as string;
    }
    return (translation as any)[field] ?? (mainEntity as any)[field] as string;
  }

  /**
   * Validate that English is not being inserted into translation table.
   * Call this in all create/update translation methods.
   */
  protected validateLocaleNotEnglish(locale: string): void {
    if (locale === 'en') {
      throw new BadRequestException(
        'English translations must be stored in the main table, not the translation table.'
      );
    }
  }
}
```

---

## Migration Strategy

### Phase 1: Schema Changes (Non-breaking)
1. Create new translation table
2. Keep existing `plant_variants` structure unchanged
3. Existing queries continue to work

### Phase 2: Data Migration

**Important:** Since the main table now serves as English default, we do NOT need to migrate existing data to the translation table. Existing English values stay in `plant_variants`.

```sql
-- No migration needed for English data
-- English values remain in plant_variants main table
-- Only add translations for other locales as they are created
```

If you want to pre-populate with a translation for existing variants:
```sql
-- Optional: Add Bengali translations for existing variants
-- (This would be done manually or via script with actual translations)
INSERT INTO plant_variant_translations (variant_id, locale, name, growth_stage, ...)
SELECT id, 'bn', NULL, NULL, ...  -- NULL means fallback to English
FROM plant_variants;
```

### Phase 3: Application Updates
1. Update repositories to join translations when needed
2. Add locale parameter to variant queries
3. Update DTOs to accept locale for variants
4. Add validation guards to prevent English insertion into translation table

---

## Frontend Integration

### Query Pattern
```typescript
// Get variants with translations for a locale
const variants = await db
  .select()
  .from(plantVariantTable)
  .leftJoin(
    plantVariantTranslationsTable,
    and(
      eq(plantVariantTable.id, plantVariantTranslationsTable.variantId),
      eq(plantVariantTranslationsTable.locale, locale)
    )
  )
  .where(eq(plantVariantTable.plantId, plantId));

// Transform for response
return variants.map(v => ({
  ...v,
  displayName: v.translations?.name ?? v.name, // fallback to English
  displayGrowthStage: v.translations?.growthStage ?? v.growthStage,
}));
```

### Filtering Pattern
```typescript
// Filter on canonical values (language-agnostic)
const filtered = await db
  .select()
  .from(plantVariantTable)
  .where(eq(plantVariantTable.growthStage, 'seedling'));
```

---

## Testing Checklist

- [ ] FK constraint to languagesTable works correctly
- [ ] Unique constraint prevents duplicate (variantId, locale) pairs
- [ ] Cascading delete removes translations when variant is deleted
- [ ] Queries with locale joins return correct translations
- [ ] Filtering on canonical values works across all locales
- [ ] Fallback to English values when translation is missing
- [ ] English insertion into translation table is rejected
- [ ] Non-English locales correctly merge with English base

---

## Pattern Coherence: Future Variant-like Entities

This **English-as-Default** pattern should be applied to similar entities in the future:

### When to Use This Pattern

| Use Case | Pattern | Example |
|----------|---------|---------|
| Product options (size, color) | English-as-Default | `name: "small"` in main, `name: "ছোট"` in translation |
| Attribute values | English-as-Default | `value: "organic"` in main, `value: "জৈব"` in translation |
| Enum-like display values | English-as-Default | `status: "active"` in main, `status: "সক্রিয়"` in translation |

### When NOT to Use This Pattern

| Use Case | Pattern | Example |
|----------|---------|---------|
| Full content translations | Standard (all locales in translation table) | Plant name, description, shop about |
| Purely numeric/structured data | No translation needed | Price, stock count, dimensions |
| User-generated content | Standard or separate system | Reviews, comments |

### Repository Base Class

Create a reusable base class for all English-as-default entities:

```typescript
// src/_repositories/base/translatable-entity.repository.ts
export abstract class EnglishAsDefaultTranslatableRepository {
  // Shared implementation for getDisplayValue, validateLocaleNotEnglish, etc.
}
```

---

## Related Files

| File | Purpose |
|------|---------|
| [`src/_db/drizzle/schema/plant/plant.schema.ts`](src/_db/drizzle/schema/plant/plant.schema.ts) | Main plant table |
| [`src/_db/drizzle/schema/plant/plant-translation.schema.ts`](src/_db/drizzle/schema/plant/plant-translation.schema.ts) | Plant translations (to be fixed) |
| [`src/_db/drizzle/schema/plant/plant-variant.schema.ts`](src/_db/drizzle/schema/plant/plant-variant.schema.ts) | Variant table (English default) |
| [`src/_db/drizzle/schema/i18n/language.schema.ts`](src/_db/drizzle/schema/i18n/language.schema.ts) | Language registry |
| [`src/_db/drizzle/schema/taxonomy/category-translation.schema.ts`](src/_db/drizzle/schema/taxonomy/category-translation.schema.ts) | Reference pattern (standard) |
| [`plans/MULTILINGUAL_VARIANT_ATTRIBUTES_PLAN.md`](plans/MULTILINGUAL_VARIANT_ATTRIBUTES_PLAN.md) | This plan document |
