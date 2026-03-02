# Tag Groups Module

The Tag Groups module is responsible for managing a high-level taxonomy entity used to group multiple `Tags`. For instance, a Tag Group might be "Colors" or "Sizes", within which actual tags like "Red" or "Large" reside.

This module supports:
1. Standard CRUD operations for Tag Groups.
2. Complete i18n support via sub-resource `translations`.
3. An advanced creation workflow allowing the simultaneous creation of a Tag Group along with its child Tags and all their translations in a single transactional request.

## Endpoints

### 1. Create a Tag Group
Creates a new Tag Group. Optionally allows nested creation of its child Tags and their translations.

-   **URL:** `POST /admin/tag-groups`
-   **Input (`CreateTagGroupDto`):**
    ```json
    {
      "slug": "string (min 1, max 255)", 
      "isActive": "boolean (optional)",
      "translations": [
        {
          "locale": "string (min 2, max 10, e.g., 'en', 'fr')",
          "name": "string (min 1, max 255)",
          "description": "string (optional)"
        }
      ],
      "tags": [ // Optional: create children inline
        {
          "slug": "string",
          "isActive": "boolean (optional)",
          "translations": [
             { "locale": "string", "name": "string", "description": "string (optional)" }
          ]
        }
      ]
    }
    ```
    *Note: An English ('en') translation is required for both the group and any inline tags.*
-   **Output:** Returns the created `TagGroup` entity.

### 2. Get All Tag Groups
Retrieves a paginated list of Tag Groups.

-   **URL:** `GET /admin/tag-groups`
-   **Query Parameters (`TagGroupQueryDto`):**
    -   `page`: number (default: 1)
    -   `limit`: number (default: 10)
    -   `search`: string (optional, searches against translated names)
    -   `id`: UUID (optional)
    -   `name`: string (optional, exact match on translation name)
    -   `isActive`: 'true' | 'false' (optional)
    -   `sortBy`: 'createdAt' | 'updatedAt' (default: 'createdAt')
    -   `sortOrder`: 'asc' | 'desc' (default: 'desc')
-   **Output:** Returns a paginated list of Tag Groups. The English locale translation is flattened directly onto the group object (`name`), and an array of up to 3 active child `tags` is embedded in the response.
### 3. Get Tag Group by ID
Retrieves a single Tag Group.

-   **URL:** `GET /admin/tag-groups/:groupId`
-   **URL Parameters:** `groupId` must be a valid UUID.
-   **Output:** Returns the `TagGroup` entity and its `translations` array.

### 4. Update Tag Group
Updates a Tag Group's core details (slug and active status).

-   **URL:** `PATCH /admin/tag-groups/:groupId`
-   **URL Parameters:** `groupId` must be a valid UUID.
-   **Input (`UpdateTagGroupDto`):**
    ```json
    {
      "slug": "string (optional)",
      "isActive": "boolean (optional)"
    }
    ```
-   **Output:** Returns the updated `TagGroup` entity.

### 5. Delete Tag Group
Soft deletes a Tag Group.

-   **URL:** `DELETE /admin/tag-groups/:groupId`
-   **URL Parameters:** `groupId` must be a valid UUID.
-   **Output:** Returns a success message. 
    *Note: Fails with `BadRequestException` if the group still contains active Tags.*

---

## Tag Group Translations Sub-resource

### 1. Get Group Translations
-   **URL:** `GET /admin/tag-groups/:groupId/translations`
-   **Output:** Array of translation objects for the specific group.

### 2. Upsert Group Translation
-   **URL:** `POST /admin/tag-groups/:groupId/translations`
-   **Input (`UpsertTagGroupTranslationDto`):**
    ```json
    {
      "locale": "string (min 2, max 10)",
      "name": "string (min 1)",
      "description": "string (optional)"
    }
    ```
-   **Output:** Returns the created/updated translation entity.

### 3. Delete Group Translation
-   **URL:** `DELETE /admin/tag-groups/:groupId/translations/:locale`
-   **Output:** Returns a success message.

---

## Tags Sub-resource (Routed via Groups)

To strictly bind Tags to a Tag Group at creation or fetch time, the `AdminTagGroupsController` delegates these nested routes to the `AdminTagsService`.

### 1. Create a Tag in a Group
-   **URL:** `POST /admin/tag-groups/:groupId/tags`
-   **Input (`CreateTagDto`):** 
    ```json
    {
      "slug": "string",
      "isActive": "boolean (optional)",
      "translations": [
        { "locale": "string", "name": "string", "description": "string (optional)" }
      ]
    }
    ```
    *Note: The `groupId` in the URL parameter forcefully overrides any `groupId` in the JSON body.*
-   **Output:** Returns the created `Tag` entity.

### 2. Get Tags by Group
-   **URL:** `GET /admin/tag-groups/:groupId/tags`
-   **Query Parameters:** Standard `TagQueryDto` pagination and search limits.
-   **Output:** Paginated tags scoped strictly to this `groupId`.
