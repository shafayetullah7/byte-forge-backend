# Tags Module

The Tags module manages the individual `Tags` inside the Taxonomy system. A Tag is typically assigned to items like Products, and must belong to exactly one `TagGroup`.

This module manages:
1. Standard CRUD capabilities for individual Tags.
2. Complete i18n support via sub-resource `translations`.
3. Advanced update capabilities, such as safely moving a Tag from one Tag Group to another while maintaining group item counters.

## Endpoints

### 1. Get Tag by ID
Retrieves a single Tag entity.

-   **URL:** `GET /admin/tags/:tagId`
-   **URL Parameters:** `tagId` must be a valid UUID.
-   **Output:** Returns the `Tag` entity alongside its nested `translations` array.

### 2. Update Tag
Updates a Tag. This endpoint uniquely allows moving a Tag between different Tag Groups.

-   **URL:** `PATCH /admin/tags/:tagId`
-   **URL Parameters:** `tagId` must be a valid UUID.
-   **Input (`UpdateTagDto`):**
    ```json
    {
      "groupId": "UUID (optional, used to move the tag between groups)",
      "slug": "string (optional)",
      "isActive": "boolean (optional)"
    }
    ```
-   **Output:** Returns the updated `Tag` entity.
    *Note: If `groupId` is modified, the system automatically uses a transaction to decrement the source group's counter and increment the destination group's counter.*

### 3. Delete Tag
Soft deletes a Tag.

-   **URL:** `DELETE /admin/tags/:tagId`
-   **URL Parameters:** `tagId` must be a valid UUID.
-   **Output:** Returns a success message.
    *Note: Fails with `BadRequestException` if the Tag's `usageCount` is greater than 0 (i.e. it is currently attached to system products).* Automatically decrements its parent Tag Group's counter upon success.

---

## Tag Translations Sub-resource

Translations for Tags work exactly like Translations for Tag Groups.

### 1. Get Tag Translations
-   **URL:** `GET /admin/tags/:tagId/translations`
-   **URL Parameters:** `tagId` must be a valid UUID.
-   **Output:** Array of translation objects specifically for the given Tag.

### 2. Upsert Tag Translation
-   **URL:** `POST /admin/tags/:tagId/translations`
-   **URL Parameters:** `tagId` must be a valid UUID.
-   **Input (`UpsertTagTranslationDto`):**
    ```json
    {
      "locale": "string (min 2, max 10, e.g., 'en', 'fr')",
      "name": "string (min 1)",
      "description": "string (optional)"
    }
    ```
-   **Output:** Returns the created or updated translation entity.

### 3. Delete Tag Translation
-   **URL:** `DELETE /admin/tags/:tagId/translations/:locale`
-   **URL Parameters:** 
    - `tagId`: UUID
    - `locale`: string
-   **Output:** Returns a success message.

---

## General Rules

-   **Group Attachment:** Unlike fetching all Tag Groups globally, fetching Tags linearly without a Group scope is primarily handled via the group-nested routes in the `tag-groups` module (i.e., `GET /admin/tag-groups/:groupId/tags`). This module focuses heavily on direct entity traversal, mutations, and locale modifications once the Tag's specific UUID is known.
-   **Unique Slugs:** Tag slugs must be globally unique across all Tag Groups.
