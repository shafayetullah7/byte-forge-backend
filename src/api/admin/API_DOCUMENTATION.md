# Admin API Module Documentation

## Base Path
All endpoints in this module are prefixed with `/v1/admin`.

> [!IMPORTANT]
> **Authentication**: Endpoints generally require admin authentication via the `AdminAuthGuard` (JWT in HttpOnly cookies).
> **CSRF Protection**: State-changing requests (`POST`, `PUT`, `PATCH`, `DELETE`) require an `X-XSRF-TOKEN` header. Its value must match the `xsrf-token` cookie.

---

## 1. Admin Profile
**Controller**: `AdminController`  
**Path**: `/v1/admin/profile`

### `GET /v1/admin/profile`
Retrieves the logged-in admin's profile information.

- **Authentication**: Required (`AdminAuthGuard`)
- **Request Body**: None
- **Response**: `{ success: true, message: string, data: AdminProfile }`
  ```json
  {
    "id": "uuid",
    "firstName": "string",
    "lastName": "string",
    "userName": "string",
    "avatar": "url string | null",
    "createdAt": "ISO date string",
    "updatedAt": "ISO date string"
  }
  ```

### `PATCH /v1/admin/profile`
Updates the logged-in admin's profile information.

- **Authentication**: Required (`AdminAuthGuard`)
- **CSRF**: `X-XSRF-TOKEN` header required
- **Request Body**: Partial profile updates
  ```json
  {
    "firstName": "string (optional, max 50)",
    "lastName": "string (optional, max 50)",
    "avatar": "url string (optional)"
  }
  ```
- **Response**: `{ success: true, message: string, data: AdminProfile }`

---

## 2. Admin Authentication
**Controller**: `AdminAuthController`  
**Path**: `/v1/admin/auth`

### `POST /v1/admin/auth/register`
Registers a new admin account.

- **Authentication**: None
- **Request Body**: `CreateLocalAdminDto`
  ```json
  {
    "firstName": "string (min 1, max 50, letters only)",
    "lastName": "string (min 1, max 50, letters only)",
    "userName": "string (min 3, max 50, lowercase/numbers/underscores)",
    "email": "string (valid email, max 255)",
    "password": "string (min 8, at least 1 uppercase, 1 lowercase, 1 number, 1 special)"
  }
  ```
- **Response**: The newly created admin record.

### `POST /v1/admin/auth/login`
Logs in as an admin and initializes a JWT-based session.

- **Authentication**: Email & Password
- **Request Body**: `LoginLocalAdminDto`
- **Response**:
  - Sets **HttpOnly Secure** cookies: `adminAccessToken`, `adminRefreshToken`.
  - Sets **Readable Secure** cookie: `xsrf-token`.
  ```json
  {
    "success": true,
    "message": "Logged in successfully",
    "data": {
      "tokens": {
        "accessToken": "jwt_string",
        "refreshToken": "jwt_string"
      },
      "admin": { "id": "uuid", "..." }
    }
  }
  ```

### `GET /v1/admin/auth/check`
Checks if the admin is currently authenticated.

- **Authentication**: Required (`AdminAuthGuard`)
- **Response**: `{ success: true, message: string, data: AdminProfile }`
  ```json
  {
    "success": true,
    "message": "Admin authenticated successfully",
    "data": {
      "id": "uuid",
      "firstName": "string",
      "lastName": "string",
      "userName": "string",
      "avatar": "url string | null"
    }
  }

### `POST /v1/admin/auth/refresh`
Refreshes the current authentication session to obtain a new access token.

- **Authentication**: Required (`adminRefreshToken` cookie)
- **Response**:
  - Re-sets the **adminAccessToken** cookie.
  - Rotates the **xsrf-token** cookie.
  ```json
  {
    "success": true,
    "message": "Token refreshed successfully",
    "data": {
      "tokens": { "accessToken": "new_jwt", "refreshToken": "same_persistent_refresh_jwt" },
      "admin": { "..." }
    }
  }
  ```

### `POST /v1/admin/auth/logout`
Logs out the current admin session.

- **Authentication**: Required (`AdminAuthGuard`)
- **CSRF**: `X-XSRF-TOKEN` header required
- **Response**: `{ success: true, message: string }`
  - *Side Effect*: Clears all admin authentication and CSRF cookies.

---

## 3. Admin Sessions
**Controller**: `AdminSessionController`  
**Path**: `/v1/admin/session`

> [!NOTE]
> Routes are not actively exposed on the controller yet, but the `AdminSessionService` handles session creation and retrieval.

### `(Internal) createAdminAuthSession()`
Creates a new active session for an authenticated admin.

- **Input Payload**: 
  - `adminAuth`: The authenticated admin and local auth record.
  - `deviceInfo`: Parsed user-agent device information.
  - `ip`: Client IP address.
- **Behavior**: 
  - Creates a base session record (expires in 7 days).
  - Cross-references it in `admin_sessions` and `admin_local_auth_sessions`.
- **Returns**: The newly created session record.

### `(Internal) getAdminSession(sessionId)`
Retrieves an active admin session and its associated admin user data.

- **Input**:
  - `sessionId` (uuid string)
- **Returns**: `{ admin: TAdmin, session: TSession } | null`

---

## 4. Admin Tree Categories
**Controller**: `AdminTreeCategoryController`  
**Path**: `/v1/admin/tree-categories`  
**Authentication**: Required (`AdminAuthGuard`)

This section handles the administrative CRUD operations for tree categories.

### `POST /v1/admin/tree-categories`
Creates a new tree category.

- **Authentication**: Required (`AdminAuthGuard`)
- **CSRF**: `X-XSRF-TOKEN` header required
- **Request Body** (`CreateCategoryDto`):
  ```json
  {
    "name": "string (min 1, max 255)", 
    "description": "string (optional)",
    "iconId": "uuid (optional)",
    "isHidden": "boolean (optional)"
  }
  ```
- **Response**: The newly created category data.

### `GET /v1/admin/tree-categories`
Retrieves a list of all tree categories.

- **Query Parameters** (`CategoryFilterDto`):
  - `id` (uuid, optional)
  - `searchKey` (string, optional)
  - `name` (string, optional)
  - `isHidden` (boolean, optional)
  - `isDeleted` (boolean, optional)
- **Response**: Paginated/filtered list of categories.

### `GET /v1/admin/tree-categories/:id`
Retrieves details for a specific tree category by its ID.

- **Path Parameters**:
  - `id` (uuid string): The unique identifier of the category.
- **Response**: The specified category data.

### `PUT /v1/admin/tree-categories/:id`
Updates an existing tree category.

- **Authentication**: Required (`AdminAuthGuard`)
- **CSRF**: `X-XSRF-TOKEN` header required
- **Path Parameters**:
  - `id` (uuid string): The unique identifier of the category.
- **Request Body** (`UpdateCategoryDto`): Partial of `CreateCategoryDto`.
  ```json
  {
    "name": "string (optional)", 
    "description": "string (optional)",
    "iconId": "uuid (optional)",
    "isHidden": "boolean (optional)"
  }
  ```
- **Response**: The updated category data.

### `DELETE /v1/admin/tree-categories/:id`
Performs a soft delete on a specific tree category.

- **Authentication**: Required (`AdminAuthGuard`)
- **CSRF**: `X-XSRF-TOKEN` header required
- **Path Parameters**:
  - `id` (uuid string): The unique identifier of the category.
- **Response**: Success confirmation of soft delete.
