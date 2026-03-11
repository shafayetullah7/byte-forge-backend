# Media Uses Count Refactor Plan

## Overview

Refactor the media tracking system from a single `usedAt` timestamp to a `usesCount` counter. This allows tracking how many entities are using a media file, enabling identification of orphaned/unused media.

## Current Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CURRENT SYSTEM                                │
├─────────────────────────────────────────────────────────────────────────┤
│  media table                                                            │
│  ├── usedAt: timestamp (null = unused, not null = used)               │
│  └── uses: JSON (stores where it's used, but not used effectively)    │
│                                                                         │
│  Problem: Only tracks IF used, not HOW MANY times                      │
└─────────────────────────────────────────────────────────────────────────┘
```

## Target Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          TARGET SYSTEM                                  │
├─────────────────────────────────────────────────────────────────────────┤
│  media table                                                            │
│  └── usesCount: integer (0 = unused, >0 = used N times)               │
│                                                                         │
│  Benefits:                                                              │
│  - Can identify truly unused media (usesCount === 0)                   │
│  - Can see media usage across multiple entities                         │
│  - Can safely delete when count reaches 0                               │
└─────────────────────────────────────────────────────────────────────────┘
```

## Entities That Use Media

| Entity | Table | Media Usage | Current Handling |
|--------|-------|-------------|------------------|
| Shop | `shopTable` | `logoId` | Sets `usedAt` on create/update |
| Plant | `plantMediaTable` | `mediaId` | Links via junction table |
| Plant Variant | `plantVariantTable` | (future) | - |
| Manager | `managerTable` | `managerImage` | - |

## Implementation Plan

### Phase 1: Database Schema Changes

- [ ] **1.1** Add `usesCount` column to `mediaTable`
  - File: `src/_db/drizzle/schema/media/media.schema.ts`
  - Change: Replace `usedAt: timestamp` with `usesCount: integer().default(0).notNull()`

- [ ] **1.2** Create migration file for schema change

- [ ] **1.3** Update TypeScript types in `media.schema.ts`

### Phase 2: Repository Layer Changes

- [ ] **2.1** Update `MediaRepository`
  - File: `src/_repositories/providers/media/media.repository/media.repository.ts`
  
  Changes needed:
  - Replace `useMedia()` - increment counter instead of set timestamp
  - Add `releaseMedia()` - decrement counter when entity removes media
  - Update `areMediaUsed()` - check `usesCount > 0` instead of `usedAt != null`
  - Update queries to use `usesCount` instead of `usedAt`

- [ ] **2.2** Update `media.service.ts`
  - File: `src/api/media/media.service.ts`
  
  Changes needed:
  - Update `deleteMedia()` - allow deletion when `usesCount === 0`
  - Update `getUserMedia()` - filter by `usesCount` instead of `usedAt`

### Phase 3: Entity Service Updates

- [ ] **3.1** Update Shop Service
  - File: `src/api/user/seller/shop/shop.service.ts`
  - File: `src/_repositories/business/shop.repository/shop.repository.ts`
  
  Changes:
  - On shop create: increment `usesCount` for logo
  - On shop update (logo change): decrement old, increment new
  - On shop delete: decrement logo count

- [ ] **3.2** Update Plant Service  
  - File: `src/api/user/seller/seller-plant/seller-plant.service.ts`
  - File: `src/_repositories/business/plant.repository/plant.repository.ts`
  
  Changes:
  - On plant create: increment count for each media
  - On plant update (media change): syncMedia needs to decrement removed, increment added
  - On plant delete: decrement all associated media counts

### Phase 4: Utility Functions

- [ ] **4.1** Create media tracking utility
  - File: `src/common/utils/media-tracking.util.ts` (new)
  
  Functions:
  ```typescript
  // Increment usage when entity assigns media
  async function incrementMediaUsage(mediaIds: string[], tx: DrizzleTx)
  
  // Decrement usage when entity removes/replaces media  
  async function decrementMediaUsage(mediaIds: string[], tx: DrizzleTx)
  
  // Get all unused media (usesCount === 0)
  async function findUnusedMedia(userId: string, tx: DrizzleTx)
  ```

### Phase 5: Testing & Cleanup

- [ ] **5.1** Write unit tests for new counter logic
- [ ] **5.2** Test migration with existing data
- [ ] **5.3** Remove unused `uses` JSON column (optional, after verification)
- [ ] **5.4** Remove unused `usedAt` column (after migration success)

## File Changes Summary

| File | Change Type | Description |
|------|-------------|-------------|
| `src/_db/drizzle/schema/media/media.schema.ts` | Modify | Replace `usedAt` with `usesCount` |
| `src/_repositories/providers/media/media.repository/media.repository.ts` | Modify | Update counter logic |
| `src/api/media/media.service.ts` | Modify | Update deletion logic |
| `src/api/user/seller/shop/shop.service.ts` | Modify | Update media usage tracking |
| `src/_repositories/business/shop.repository/shop.repository.ts` | Modify | Update media sync |
| `src/api/user/seller/seller-plant/seller-plant.service.ts` | Modify | Update media sync |
| `src/_repositories/business/plant.repository/plant.repository.ts` | Modify | Update syncMedia logic |

## Migration Strategy

```sql
-- Add new column
ALTER TABLE media ADD COLUMN uses_count INTEGER NOT NULL DEFAULT 0;

-- Migrate existing data: if usedAt was set, set usesCount to 1
UPDATE media SET uses_count = 1 WHERE used_at IS NOT NULL;

-- Verify, then drop old column
ALTER TABLE media DROP COLUMN used_at;
```

## Key Considerations

1. **Race Conditions**: Use database transactions with row-level locking
2. **Atomic Operations**: Increment/decrement must be atomic (use `+= 1` or database functions)
3. **Data Integrity**: Add check constraint `usesCount >= 0`
4. **Edge Cases**: 
   - What if decrement goes below 0? (Should not happen with proper tracking)
   - What if same media ID is used twice in same entity? (Track unique usages)

## Success Criteria

- [ ] Media can be deleted only when `usesCount === 0`
- [ ] Replacing media in entity correctly updates counts
- [ ] Deleting entity correctly decrements associated media counts
- [ ] System can identify truly orphaned media
