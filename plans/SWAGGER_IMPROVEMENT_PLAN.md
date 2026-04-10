# Swagger Documentation Improvement Plan

## Executive Summary

Transform the current **Level 2 (Functional)** Swagger implementation to **Level 4 (Enterprise)** with Level 5 elements, enabling intuitive navigation and comprehensive API documentation for all consumers (developers, integrators, internal teams).

---

## Current State Analysis

### What's Working ✅
- Basic `@ApiTags` on all controllers
- `@ApiOperation({ summary })` on most endpoints
- `@ApiResponse` with basic status codes (200, 201, 400, 401, 404)
- `@ApiBearerAuth` for protected endpoints
- JWT authentication configured in `main.ts`

### What's Missing ❌

| Area | Current State | Gap |
|------|--------------|-----|
| **Navigation** | 3 broad tags (User, Admin, Public) | No workflow grouping, no persona-based organization |
| **DTOs** | No `@ApiProperty` decorators | No field descriptions, examples, validation info |
| **Error Responses** | Generic descriptions only | No error code schemas, no example payloads |
| **Request Bodies** | No `@ApiBody`, `@ApiConsumes` (partial) | No request examples |
| **Query Parameters** | No `@ApiQuery` | No pagination, filtering, sorting docs |
| **API Metadata** | Basic title + description | No servers, contact, license, rate limits |
| **Cross-References** | None | No "see also" links between operations |
| **Pagination** | Not documented | No standard paginated response schema |
| **File Upload** | Partial (`@ApiConsumes`) | No format, size, type examples |

---

## Target Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      TARGET SWAGGER STRUCTURE                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  🚀 GETTING STARTED                                                     │
│  ├─ Quick Start Guide                                                  │
│  ├─ Authentication Flow                                                │
│  └─ Error Handling                                                    │
│                                                                         │
│  👤 AUTHENTICATION                                                     │
│  ├─ User Auth → Register, Login, Logout, OTP                          │
│  ├─ Admin Auth → Login, Refresh                                       │
│  └─ Password Reset → Forgot, Verify, Reset                           │
│                                                                         │
│  👤 SHOPPER (Public APIs)                                             │
│  ├─ Browse Shops → List, Get by Slug                                  │
│  ├─ Browse Plants → Search, Filter, Get Details                       │
│  └─ Categories → Tree, Ancestors                                       │
│                                                                         │
│  🏪 SELLER DASHBOARD                                                  │
│  ├─ Shop Setup → Apply, Get Status, Branding, Contact                │
│  ├─ Plant Catalog → CRUD Plants, Media Management                    │
│  └─ Media → Upload, Delete, List                                      │
│                                                                         │
│  🔐 ADMIN PANEL                                                        │
│  ├─ Shop Management → Verify, Suspend, Deactivate, Reactivate        │
│  ├─ Taxonomy → Categories, Tags, Tag Groups                           │
│  └─ Languages → CRUD                                                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Foundation (Infrastructure)

#### 1.1 Upgrade Swagger Configuration
**File:** `src/main.ts`

```typescript
// Enhanced DocumentBuilder
const swaggerConfig = new DocumentBuilder()
  .setTitle('ByteForge E-Commerce API')
  .setDescription(`
## About ByteForge API

A comprehensive e-commerce platform API for buying and selling plants online.

### Features
- 🏪 Multi-vendor shop management
- 🌱 Plant catalog with variants
- 📦 Order management
- 🏷️ Taxonomy & categorization
- 📱 Media management

### Authentication
All protected endpoints require JWT authentication via Bearer token.

### Rate Limits
- Standard endpoints: 100 requests/minute
- Bulk operations: 10 requests/minute

### Error Handling
All errors follow a standard format:
\`\`\`json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "details": []
}
\`\`\`
  `)
  .setVersion('1.0')
  .addServer('https://api.byteforge.com/v1', 'Production')
  .addServer('https://staging-api.byteforge.com/v1', 'Staging')
  .addServer('http://localhost:3000/api', 'Local Development')
  .setContact(
    'ByteForge API Support',
    'https://byteforge.com/support',
    'api-support@byteforge.com'
  )
  .setLicense('Proprietary', 'https://byteforge.com/license')
  // ... rest of config
```

#### 1.2 Create Shared Decorators
**New File:** `src/common/decorators/swagger.decorators.ts`

```typescript
import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { PaginatedResponseDto } from './dto/paginated-response.dto';

// Standard auth decorator
export const ApiAuth = () => applyDecorators(
  ApiBearerAuth('JWT-auth'),
);

// Paginated response decorator
export const ApiPaginatedResponse = <T>(type: Type<T>) =>
  applyDecorators(
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginatedResponseDto) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(type) },
              },
            },
          },
        ],
      },
    }),
  );
```

#### 1.3 Create Standard Response DTOs
**New File:** `src/common/dto/swagger-response.dto.ts`

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';

export class ErrorDetailDto {
  @ApiProperty({ example: 'email' })
  @IsString()
  field: string;

  @ApiProperty({ example: 'Invalid email format' })
  @IsString()
  message: string;
}

export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  @IsNumber()
  statusCode: number;

  @ApiProperty({ example: 'Validation failed' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ example: 'VALIDATION_ERROR' })
  @IsOptional()
  @IsString()
  errorCode?: string;

  @ApiPropertyOptional({ type: [ErrorDetailDto] })
  @IsOptional()
  @IsArray()
  details?: ErrorDetailDto[];

  @ApiPropertyOptional({ example: '2026-03-11T10:00:00Z' })
  @IsOptional()
  @IsString()
  timestamp?: string;

  @ApiPropertyOptional({ example: 'POST /api/shops' })
  @IsOptional()
  @IsString()
  path?: string;
}

export class PaginatedResponseDto<T = any> {
  @ApiProperty({ type: [Object], description: 'Data items' })
  data: T[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 10 })
  totalPages: number;

  @ApiProperty({ example: true })
  hasNext: boolean;

  @ApiProperty({ example: false })
  hasPrev: boolean;
}
```

---

### Phase 2: Navigation & Organization

#### 2.1 Restructure API Tags

| Current Tag | New Tag | Controller |
|-------------|---------|------------|
| `User` | `👤 Authentication - User` | `user-auth.controller.ts` |
| `User` | `👤 User Profile` | `user.controller.ts` |
| `User` | `🔐 Password Reset` | `password-reset.controller.ts` |
| `User` | `🏪 Seller - Shop Setup` | `shop.controller.ts` |
| `User` | `🌱 Seller - Plant Catalog` | `seller-plant.controller.ts` |
| `User` | `📁 Media` | `media.controller.ts` |
| `Admin` | `🔐 Admin Auth` | `admin-auth.controller.ts` |
| `Admin` | `🏪 Admin - Shop Management` | `admin-shop.controller.ts` |
| `Admin` | `🏷️ Admin - Taxonomy` | `admin-*.controller.ts` |
| `Admin` | `🌍 Admin - Languages` | `admin-languages.controller.ts` |
| `Public` | `🏪 Public - Shops` | `public-shop.controller.ts` |
| `Public` | `📂 Public - Categories` | `tree-categories.controller.ts` |

#### 2.2 Add Tag Descriptions
**File:** `src/main.ts`

```typescript
.addTag('🚀 Getting Started', 'API overview, authentication, and error handling')
.addTag('👤 Authentication - User', 'User registration, login, logout, OTP verification')
.addTag('👤 User Profile', 'Get and update user profile')
.addTag('🔐 Password Reset', 'Request password reset, verify OTP, set new password')
.addTag('🏪 Seller - Shop Setup', 'Apply for seller, manage shop details and branding')
.addTag('🌱 Seller - Plant Catalog', 'Create, read, update, delete plants')
.addTag('📁 Media', 'Upload, delete, and manage media files')
.addTag('🔐 Admin Auth', 'Admin login, refresh token, logout')
.addTag('🏪 Admin - Shop Management', 'Verify, suspend, deactivate, reactivate shops')
.addTag('🏷️ Admin - Taxonomy', 'Manage categories, tags, and tag groups')
.addTag('Admin - Languages', 'Manage supported languages')
.addTag('🏪 Public - Shops', 'Browse shops without authentication')
.addTag('📂 Public - Categories', 'Browse category tree and details')
```

#### 2.3 Update Controller Tags (Batch Update)

**Pattern for each controller:**
```typescript
// BEFORE
@ApiTags('User')
@Controller('user/seller/shops')

// AFTER  
@ApiTags('🏪 Seller - Shop Setup')
@Controller('user/seller/shops')
```

---

### Phase 3: DTO Documentation

#### 3.1 Create Fully Documented DTO Example

**File:** `src/api/user/seller/shop/dto/apply-seller.dto.ts`

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsObject,
  IsArray,
  ValidateNested,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

class ShopAddressDto {
  @ApiProperty({
    description: 'Street address line 1',
    example: '123 Garden Street',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  street: string;

  @ApiPropertyOptional({
    description: 'Street address line 2',
    example: 'Apartment 4B',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  street2?: string;

  @ApiProperty({
    description: 'City name',
    example: 'Dhaka',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  city: string;

  @ApiProperty({
    description: 'State or province',
    example: 'Dhaka Division',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  state: string;

  @ApiProperty({
    description: 'Postal code',
    example: '1200',
    maxLength: 20,
  })
  @IsString()
  @MaxLength(20)
  postalCode: string;

  @ApiProperty({
    description: 'Country code (ISO 3166-1 alpha-2)',
    example: 'BD',
    maxLength: 2,
  })
  @IsString()
  @MaxLength(2)
  country: string;
}

class ShopTranslationDto {
  @ApiProperty({
    description: 'Locale code (ISO 639-1)',
    example: 'en',
    pattern: '^[a-z]{2}$',
  })
  @IsString()
  locale: string;

  @ApiProperty({
    description: 'Shop name in this locale',
    example: 'Green Thumb Nursery',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  shopName: string;

  @ApiPropertyOptional({
    description: 'Shop description',
    example: 'Your trusted source for premium indoor and outdoor plants',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  about?: string;

  @ApiPropertyOptional({
    description: 'Brand story or history',
    example: 'Founded in 2020 with a mission to bring nature to every home',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  brandStory?: string;
}

export class ApplySellerDto {
  @ApiPropertyOptional({
    description: 'Logo media ID (must be uploaded first via /media/upload)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  logoId?: string;

  @ApiPropertyOptional({
    description: 'Banner image media ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  bannerId?: string;

  @ApiProperty({
    description: 'Physical shop address',
    type: ShopAddressDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => ShopAddressDto)
  address: ShopAddressDto;

  @ApiProperty({
    description: 'Localized shop information',
    type: [ShopTranslationDto],
    minItems: 1,
    description: 'At least one translation is required (typically English)',
    example: [
      {
        locale: 'en',
        shopName: 'Green Thumb Nursery',
        about: 'Premium plants since 2020',
        brandStory: 'Founded with love for plants',
      },
      {
        locale: 'bn',
        shopName: 'গ্রিন থাম্ব নার্সারি',
        about: '২০২০ সাল থেকে প্রিমিয়াম গাছ',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShopTranslationDto)
  translations: ShopTranslationDto[];

  @ApiProperty({
    description: 'Trade license number',
    example: 'TRADE-2026-001234',
    minLength: 5,
    maxLength: 50,
  })
  @IsString()
  @MinLength(5)
  @MaxLength(50)
  tradeLicenseNumber: string;

  @ApiPropertyOptional({
    description: 'Trade license document media ID',
    example: '123e4567-e89b-12d3-a456-426614174002',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  tradeLicenseDocumentId?: string;

  @ApiPropertyOptional({
    description: 'Tax Identification Number',
    example: '1234567890',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  tinNumber?: string;

  @ApiPropertyOptional({
    description: 'TIN document media ID',
    example: '123e4567-e89b-12d3-a456-426614174003',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  tinDocumentId?: string;

  @ApiPropertyOptional({
    description: 'Utility bill document media ID (for address verification)',
    example: '123e4567-e89b-12d3-a456-426614174004',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  utilityBillDocumentId?: string;
}
```

#### 3.2 Batch DTO Improvements

Create a script or manually update all DTOs with:
- `@ApiProperty` with description, example, required status
- `@ApiPropertyOptional` for optional fields
- Nested object documentation with `@ValidateNested`
- Array documentation with minItems, maxItems
- All validation decorators reflected in docs

---

### Phase 4: Error Response Documentation

#### 4.1 Create Error Response Decorator

**File:** `src/common/decorators/api-error.decorator.ts`

```typescript
import { applyDecorators, Type } from '@nestjs/common';
import { ApiResponse, ApiResponseOptions } from '@nestjs/swagger';

type ErrorCase = {
  status: number;
  description: string;
  example?: Record<string, any>;
};

export const ApiErrorResponse = (
  status: number,
  description: string,
  errorCode?: string,
  example?: Record<string, any>,
) => {
  const defaultExample = {
    statusCode: status,
    message: description,
    errorCode: errorCode || `${status}_ERROR`,
    timestamp: new Date().toISOString(),
  };

  return ApiResponse({
    status,
    description,
    schema: {
      example: example || defaultExample,
    },
  });
};

// Pre-defined error responses
export const ApiBadRequestResponse = (errorCode?: string) =>
  ApiErrorResponse(400, 'Validation failed', errorCode || 'VALIDATION_ERROR', {
    statusCode: 400,
    message: 'Validation failed',
    errorCode: errorCode || 'VALIDATION_ERROR',
    details: [
      { field: 'email', message: 'Invalid email format' },
      { field: 'password', message: 'Password must be at least 8 characters' },
    ],
  });

export const ApiUnauthorizedResponse = () =>
  ApiErrorResponse(401, 'Authentication required', 'UNAUTHORIZED', {
    statusCode: 401,
    message: 'Authentication required',
    errorCode: 'UNAUTHORIZED',
  });

export const ApiForbiddenResponse = (message = 'Access denied') =>
  ApiErrorResponse(403, message, 'FORBIDDEN', {
    statusCode: 403,
    message,
    errorCode: 'FORBIDDEN',
  });

export const ApiNotFoundResponse = (resource = 'Resource') =>
  ApiErrorResponse(404, `${resource} not found`, 'NOT_FOUND', {
    statusCode: 404,
    message: `${resource} not found`,
    errorCode: 'NOT_FOUND',
  });

export const ApiConflictResponse = (message: string, errorCode?: string) =>
  ApiErrorResponse(409, message, errorCode || 'CONFLICT', {
    statusCode: 409,
    message,
    errorCode: errorCode || 'CONFLICT',
  });
```

#### 4.2 Update Controller Error Responses

**Before:**
```typescript
@ApiResponse({ status: 400, description: 'Validation error' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

**After:**
```typescript
@ApiBadRequestResponse('DUPLICATE_ENTRY')
@ApiUnauthorizedResponse()
@ApiConflictResponse('Shop name already taken', 'SHOP_NAME_TAKEN')
```

---

### Phase 5: Query Parameter Documentation

#### 5.1 Create Pagination Decorator

**File:** `src/common/decorators/api-pagination.decorator.ts`

```typescript
import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

export const ApiPagination = () =>
  applyDecorators(
    ApiQuery({
      name: 'page',
      description: 'Page number (1-indexed)',
      required: false,
      type: Number,
      example: 1,
      default: 1,
      minimum: 1,
    }),
    ApiQuery({
      name: 'limit',
      description: 'Items per page',
      required: false,
      type: Number,
      example: 10,
      default: 10,
      minimum: 1,
      maximum: 100,
    }),
  );

export const ApiSorting = (allowedFields: string[]) =>
  applyDecorators(
    ApiQuery({
      name: 'sortBy',
      description: `Field to sort by (${allowedFields.join(', ')})`,
      required: false,
      type: String,
      example: allowedFields[0],
      enum: allowedFields,
    }),
    ApiQuery({
      name: 'sortOrder',
      description: 'Sort direction',
      required: false,
      type: String,
      example: 'desc',
      enum: ['asc', 'desc'],
      default: 'desc',
    }),
  );

export const ApiFiltering = () =>
  applyDecorators(
    ApiQuery({
      name: 'search',
      description: 'Search term for text fields',
      required: false,
      type: String,
      example: 'monstera',
    }),
    ApiQuery({
      name: 'status',
      description: 'Filter by status',
      required: false,
      type: String,
      enum: ['ACTIVE', 'PENDING', 'SUSPENDED', 'DEACTIVATED'],
    }),
  );
```

#### 5.2 Apply to Controllers

**Example:** `admin-shop.controller.ts`
```typescript
@Get()
@ApiPagination()
@ApiSorting(['createdAt', 'shopName', 'status'])
@Get('pending-verifications')
async getPendingVerifications() { ... }
```

---

### Phase 6: Request/Response Examples

#### 6.1 Add Examples to Operations

```typescript
@ApiOperation({
  summary: 'Apply for Seller Account',
  description: `
## When to Use
Create a new seller shop application.

## Prerequisites
1. Verified user account
2. Required documents uploaded (trade license)

## Request Body
See \`ApplySellerDto\` for complete field list.

## Response
Returns the created shop with \`PENDING\` status.

## Errors
| Code | Cause |
|------|-------|
| DUPLICATE_ENTRY | User already owns a shop |
| SHOP_NAME_TAKEN | Shop name already exists |
| VALIDATION_ERROR | Missing required fields |
`,
})
@ApiResponse({
  status: 201,
  description: 'Shop application created successfully',
  schema: {
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      ownerId: '123e4567-e89b-12d3-a456-426614174001',
      slug: 'green-thumb-nursery',
      status: 'PENDING',
      createdAt: '2026-03-11T10:00:00Z',
    },
  },
})
@Post('apply')
async applyAsSeller(@Body() dto: ApplySellerDto) { ... }
```

---

## File Changes Summary

### New Files to Create

| File | Purpose |
|------|---------|
| `src/common/decorators/swagger.decorators.ts` | Reusable Swagger decorators |
| `src/common/dto/swagger-response.dto.ts` | Standard response DTOs |
| `src/common/decorators/api-error.decorator.ts` | Error response helpers |
| `src/common/decorators/api-pagination.decorator.ts` | Pagination helpers |
| `plans/SWAGGER_IMPROVEMENT_CHECKLIST.md` | Tracking checklist |

### Files to Modify

| File | Changes |
|------|---------|
| `src/main.ts` | Enhanced Swagger config with metadata |
| All `*.controller.ts` | Updated tags, add error docs |
| All `*Dto.ts` files | Add `@ApiProperty` decorators |

---

## Implementation Order

```
Phase 1: Foundation (Week 1)
├── 1.1 Upgrade Swagger config in main.ts
├── 1.2 Create shared decorators
├── 1.3 Create standard response DTOs
└── 1.4 Test Swagger UI loads correctly

Phase 2: Navigation (Week 1-2)
├── 2.1 Restructure all API tags
├── 2.2 Add tag descriptions
└── 2.3 Verify navigation in Swagger UI

Phase 3: DTOs (Week 2-3)
├── 3.1 Document critical DTOs (ApplySellerDto, CreatePlantDto)
├── 3.2 Document all other DTOs
└── 3.3 Add nested object documentation

Phase 4: Errors (Week 3)
├── 4.1 Create error decorators
├── 4.2 Update all error responses
└── 4.3 Add error code catalog

Phase 5: Query Params (Week 3)
├── 5.1 Create pagination decorator
├── 5.2 Apply to all list endpoints
└── 5.3 Add filter/sort documentation

Phase 6: Examples (Week 4)
├── 6.1 Add request examples
├── 6.2 Add response examples
└── 6.3 Add cross-references
```

---

## Success Metrics

| Metric | Target |
|--------|--------|
| DTO coverage | 100% with `@ApiProperty` |
| Error response docs | All endpoints with all status codes |
| Tag organization | Persona-based navigation |
| Request/Response examples | Critical endpoints only (Level 4) |
| Pagination docs | All list endpoints |
| API metadata | Complete (servers, contact, license) |

---

## Notes

- **Level 4 (Enterprise)** is the target - full Level 5 requires custom Swagger UI extensions
- Consider adding **custom CSS** for better visual organization in Swagger UI
- Use **OpenAPI extensions (x-)** for custom metadata
- Consider **auto-generating** DTO docs from class-validator decorators using a script
- Document **breaking changes** process for API versioning
