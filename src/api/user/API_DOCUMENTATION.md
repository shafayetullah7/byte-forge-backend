# User API Module Documentation

## Base Path
All endpoints in this module are logically scoped to `/v1/user` as their base route.

---

## 1. User Authentication
**Controller**: `UserAuthController`  
**Path**: `/v1/user/auth`

### `POST /v1/user/auth/register`
Registers a new user account.
- **Request Body**: `CreateLocalUserDto` (First name, last name, username, email, password)
- **Response**: `{ success: true, message: string, data: object }`

### `POST /v1/user/auth/login`
Authenticates a user and sets an HTTP-only session cookie.
- **Authentication**: Handled by `UserLocalAuthGuard` (Expects local login payload like email/password)
- **Response**: `{ success: true, message: string, data: { session, user } }`
- **Side Effect**: Sets `session` cookie on response.

### `GET /v1/user/auth/check`
Checks current authentication status and returns user data.
- **Authentication**: Required (`UserAuthGuard`)
- **Response**: `{ success: true, message: string, data: user }`

### `POST /v1/user/auth/verify-email`
Verifies the user's email address using an OTP.
- **Authentication**: Required (`UserAuthGuard`)
- **Request Body**: `VerifyEmailDto` containing the OTP
- **Response**: `{ success: true, message: string }`

### `POST /v1/user/auth/send-verification-email`
Resends the verification email OTP.
- **Authentication**: Required (`UserAuthGuard`)
- **Response**: `{ success: true, message: string, data: { expiresAt } }`

### `POST /v1/user/auth/logout`
Logs out the user and clears the session cookie.
- **Authentication**: Required (`UserAuthGuard`)
- **Response**: `{ success: true, message: string }`

---

## 2. Password Reset
**Controller**: `PasswordResetController`  
**Path**: `/v1/user/password-reset`

### `POST /v1/user/password-reset/forgot`
Initiates the password reset process by sending an OTP.
- **Request Body**: `ForgotPasswordDto` (email)
- **Response**: `{ success: true, message: string, data }`

### `POST /v1/user/password-reset/verify`
Verifies the OTP sent for password reset.
- **Request Body**: `VerifyResetOtpDto` (token, otp)
- **Response**: `{ success: true, message: string, data }`

### `POST /v1/user/password-reset/resend`
Resends the OTP for password reset.
- **Request Body**: `ResendResetOtpDto` (token)
- **Response**: `{ success: true, message: string, data }`

### `POST /v1/user/password-reset/reset`
Completes the password reset by setting a new password.
- **Request Body**: `ResetPasswordDto` (token, password)
- **Response**: `{ success: true, message: string }`

---

## 3. User Profile
**Controller**: `UserController`  
**Path**: `/v1/user/profile`

### `GET /v1/user/profile`
Retrieves the logged-in user's profile information.
- **Authentication**: Required (`UserAuthGuard`)
- **Response**: `{ success: true, message: string, data: userProfile }`

---

## 4. Seller Business Account
**Controller**: `BusinessAccountController`  
**Path**: `/v1/user/seller/business-account`

### `POST /v1/user/seller/business-account`
Creates a new business account for the authenticated user.
- **Authentication**: Required (`VerifiedUserAuthGuard`)
- **Request Body**: `CreateBusinessAccountDto`
- **Response**: `{ success: true, message: string, data: BusinessAccount }`

### `GET /v1/user/seller/business-account`
Retrieves the business account belonging to the authenticated user.
- **Authentication**: Required (`VerifiedUserAuthGuard`)
- **Response**: `{ success: true, message: string, data: BusinessAccount }`

---

## 5. Seller Shops
**Controller**: `ShopController`  
**Path**: `/v1/user/seller/shops`

### `POST /v1/user/seller/shops`
Creates a new shop under the user's business account.
- **Authentication**: Required (`VerifiedUserAuthGuard`)
- **Request Body**: `SetupShopDto`
- **Response**: `{ success: true, message: string, data: Shop }`

### `GET /v1/user/seller/shops`
Retrieves all shops owned by the user.
- **Authentication**: Required (`VerifiedUserAuthGuard`)
- **Response**: `{ success: true, message: string, data: Shop[] }`

---

## 6. Seller Plants
**Controller**: `SellerPlantController`  
**Path**: `/v1/user/seller/plants`

> [!NOTE]
> All below endpoints require `VerifiedUserAuthGuard`.

### `POST /v1/user/seller/plants`
Creates a plant listing.
- **Request Body**: `CreatePlantDto`
- **Response**: The newly created plant.

### `GET /v1/user/seller/plants`
Retrieves all plants the user has listed.
- **Query Parameters**: `PlantFilterDto`
- **Response**: List of plants.

### `GET /v1/user/seller/plants/:id`
Retrieves a specific plant listing by ID.
- **Path Parameters**: `id`

### `PATCH /v1/user/seller/plants/:id`
Updates a specific plant listing.
- **Path Parameters**: `id`
- **Request Body**: `UpdatePlantDto`

### `DELETE /v1/user/seller/plants/:id`
Deletes a specific plant listing.
- **Path Parameters**: `id`
