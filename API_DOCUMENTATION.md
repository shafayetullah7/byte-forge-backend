# ByteForge API Documentation

This file provides comprehensive documentation for all API endpoints available in the ByteForge backend.

## 📋 Overview

The `api-documentation.json` file contains:

- **Complete endpoint catalog** with HTTP methods and paths
- **Request/response schemas** with validation rules
- **Authentication requirements** for each endpoint
- **Example payloads** for testing
- **Detailed field descriptions** and constraints

## 🚀 Quick Start

### Base URL

```
Development: http://localhost:3000/api
Production: <your-production-url>/api
```

### Authentication

Most endpoints require authentication via **HTTP-only session cookies**. The cookie is automatically set after successful login.

## 📚 API Categories

### 1. User Authentication (`/auth`)

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user (sets session cookie)
- `GET /auth/check` - Check authentication status
- `POST /auth/verify-email` - Verify email with OTP
- `POST /auth/send-verification-email` - Resend verification code

### 2. User Profile (`/profile`)

- `GET /profile` - Get user profile

### 3. Media Management (`/media`)

- `POST /media/upload` - Upload images/videos
- `GET /media` - Get all user media
- `DELETE /media/:id` - Delete media

### 4. Business Account (`/business-account`)

- `POST /business-account` - Create business account
- `GET /business-account` - Get business account

### 5. Shops (`/shops`)

- `POST /shops` - Create shop
- `GET /shops` - Get all user shops

### 6. Plants (`/plants`)

- `POST /plants` - Create plant product
- `GET /plants` - Get all plants
- `GET /plants/:id` - Get plant by ID
- `PATCH /plants/:id` - Update plant
- `DELETE /plants/:id` - Delete plant

### 7. Tree Categories (`/tree-categories`)

- `GET /tree-categories` - Get all categories (public)

### 8. Admin Tree Categories (`/admin/tree-categories`)

- `POST /admin/tree-categories` - Create category
- `GET /admin/tree-categories` - Get all categories
- `GET /admin/tree-categories/:id` - Get category by ID
- `PUT /admin/tree-categories/:id` - Update category
- `DELETE /admin/tree-categories/:id` - Delete category

## 🔑 Authentication Flow

1. **Register**: `POST /auth/register`

   ```json
   {
     "firstName": "John",
     "lastName": "Doe",
     "userName": "johndoe_123",
     "email": "john@example.com",
     "password": "SecurePass123!"
   }
   ```

2. **Login**: `POST /auth/login`

   ```json
   {
     "email": "john@example.com",
     "password": "SecurePass123!"
   }
   ```

   Response includes session cookie (automatically stored by browser)

3. **Verify Email**: `POST /auth/verify-email`

   ```json
   {
     "otp": "123456"
   }
   ```

4. **Check Auth**: `GET /auth/check`
   Returns user details if authenticated

## 📝 Validation Rules

### User Registration

- **firstName/lastName**: 1-50 characters, letters only
- **userName**: 3-50 characters, lowercase letters, numbers, underscores
- **Email**: Valid email format, max 255 characters
- **Password**: Min 8 characters, must include:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character

## 🛠️ Using with Postman

### Option 1: Manual Import

1. Open Postman
2. Click "Import"
3. Select `api-documentation.json`
4. Postman will create a collection with all endpoints

### Option 2: Direct Reference

Use the JSON file as a reference guide while manually creating requests in Postman.

### Important Postman Settings

- **Cookie Management**: Enable "Automatically follow redirects" and "Send cookies"
- **Base URL**: Set as environment variable `{{baseUrl}}`
- **Session Cookie**: Will be automatically stored after login

## 📖 Reading the Documentation

Each endpoint in `api-documentation.json` includes:

```json
{
  "name": "Endpoint Name",
  "method": "HTTP_METHOD",
  "path": "/endpoint/path",
  "authentication": true/false,
  "description": "What this endpoint does",
  "requestBody": {
    "schema": { /* field definitions */ },
    "example": { /* sample request */ }
  },
  "responses": {
    "200": { /* success response */ },
    "401": { /* error response */ }
  }
}
```

## 🔍 Finding Endpoints

The documentation is organized by feature area. To find an endpoint:

1. Open `api-documentation.json`
2. Navigate to the relevant section (e.g., `endpoints.user_auth`)
3. Find the endpoint by name or method
4. Review schema, examples, and responses

## 💡 Tips

- **Public Endpoints**: Look for `"authentication": false`
- **Required Fields**: Check `"required": true` in schema
- **Validation Errors**: Returns 400 with detailed error messages
- **Session Expiry**: Re-login if you get 401 Unauthorized

## 🔄 Keeping Documentation Updated

This file should be updated whenever:

- New endpoints are added
- Request/response schemas change
- Validation rules are modified
- Authentication requirements change

## 📞 Support

For questions about specific endpoints, refer to:

- Controller files in `src/api/`
- DTO files in `src/api/*/dto/`
- Service files for business logic

---

**Last Updated**: January 2026  
**API Version**: 1.0.0
