# API Integration Guide - Admin Dashboard

## Overview

This guide provides the API schema and integration details for connecting a React admin dashboard to the backend services.

---

## 🔐 Authentication

### Base URL

```
/api/v1/auth
```

### Notes

- Most endpoints here are public (login/register/refresh/reset flows) but actions that modify user data or read the current user require a valid JWT.
- For protected routes, include: `Authorization: Bearer <JWT>`.

---

### Endpoints

#### 1) Login

**Endpoint**: `POST /api/v1/auth/login`

**Request Body**

```json
{
  "email": "user@example.com",
  "password": "string"
}
```

**Response**

```json
{
  "code": "200",
  "error": false,
  "message": "Login successful",
  "data": {
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token",
    "expiresIn": 3600
  },
  "metadata": null
}
```

---

#### 2) Register

**Endpoint**: `POST /api/v1/auth/register`

**Request Body (example)**

```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "password": "P@ssw0rd!"
}
```

**Response**: Same shape as login (tokens on success).

---

#### 3) Refresh Token

**Endpoint**: `POST /api/v1/auth/refresh`

**Request Body**

```json
{
  "refreshToken": "refresh-token"
}
```

**Response**: New access token payload (same shape as login response `data`).

---

#### 4) Forgot Password (send OTP)

**Endpoint**: `POST /api/v1/auth/forgot-password?email={email}`

Sends an OTP to the provided email.

**Response**

```json
{
  "code": "200",
  "error": false,
  "message": "OTP sent to email",
  "data": null,
  "metadata": null
}
```

---

#### 5) Reset Password with OTP

**Endpoint**: `POST /api/v1/auth/reset-password`

**Request Body**

```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "P@ssw0rd!"
}
```

**Response**: 200 with success message.

---

#### 6) Change Password

**Endpoint**: `POST /api/v1/auth/change-password`

**Auth**: Required (Bearer JWT)

**Request Body**

```json
{
  "oldPassword": "string",
  "newPassword": "string"
}
```

**Response**: 200 with success message.

---

#### 7) Create Activity User (Admin)

**Endpoint**: `POST /api/v1/auth/users/activity`

**Auth**: Required (ADMIN)

Registers an activity operator account. Response returns tokens like `register`.

---

#### 8) Get Current User (Profile)

**Endpoint**: `GET /api/v1/auth/me`

**Auth**: Required (Bearer JWT)

Returns the profile of the currently authenticated user.

**Response Schema**

```json
{
  "code": "200",
  "error": false,
  "message": "Authenticated user profile retrieved",
  "data": {
    "id": "string",
    "email": "string",
    "fullName": "string",
    "profilePicture": "string|null",
    "phoneNumber": "string|null",
    "roles": ["ADMIN", "USER"],
    "emailVerified": true,
    "status": "ACTIVE",
    "globalProfiles": [
      {
        "profileType": "ACTIVITY",
        "organizationName": "string",
        "organizationId": "string"
      }
    ],
    "createdAt": 1731176400000,
    "updatedAt": 1731262800000
  },
  "metadata": null
}
```

---

## 🌍 Cities Management

### Base URL

```
/api/v1/cities
```

### Authentication

All endpoints require:

- **Header**: `Authorization: Bearer {JWT_TOKEN}`
- **Role**: `ADMIN`

---

### Endpoints

#### 1. Get All Cities

**Endpoint**: `GET /api/v1/cities/admin`  
**Auth**: Required (ADMIN)  
**Description**: Retrieve all cities with full details including audit fields

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `isActive` | Boolean | No | Filter by active status. `true` = active only, `false` = inactive only, `null/omitted` = all |

**Response Schema**:

```json
{
  "code": "string",
  "error": boolean,
  "message": "string",
  "data": [
    {
      "id": "string",
      "nameTranslations": {
        "en": "string",
        "ar": "string",
        "fr": "string"
      },
      "isActive": boolean,
      "createdAt": "ISO-8601 datetime",
      "updatedAt": "ISO-8601 datetime",
      "createdBy": "string",
      "updatedBy": "string"
    }
  ],
  "metadata": null
}
```

**Example Response**:

```json
{
  "code": "200",
  "error": false,
  "message": "Cities retrieved successfully",
  "data": [
    {
      "id": "city-123",
      "nameTranslations": {
        "en": "Casablanca",
        "ar": "الدار البيضاء",
        "fr": "Casablanca",
        "es": ""
      },
      "isActive": true,
      "createdAt": "2025-01-15T10:30:00",
      "updatedAt": "2025-11-08T14:20:00",
      "createdBy": "admin@example.com",
      "updatedBy": "admin@example.com"
    },
    {
      "id": "city-456",
      "nameTranslations": {
        "en": "Marrakech",
        "ar": "مراكش",
        "fr": "Marrakech",
        "es": ""
      },
      "isActive": true,
      "createdAt": "2025-02-10T08:15:00",
      "updatedAt": "2025-02-10T08:15:00",
      "createdBy": "admin@example.com",
      "updatedBy": "admin@example.com"
    }
  ],
  "metadata": null
}
```

---

#### 2. Create City

**Endpoint**: `POST /api/v1/cities`  
**Auth**: Required (ADMIN)  
**Description**: Create a new city with translations

**Request Body Schema**:

```json
{
  "nameTranslations": {
    "en": "string (required)",
    "ar": "string (optional)",
    "fr": "string (optional)",
    "es": "string (optional)"
  },
  "isActive": boolean
}
```

**Request Example**:

```json
{
  "nameTranslations": {
    "en": "Tangier",
    "ar": "طنجة",
    "fr": "Tanger"
  },
  "isActive": true
}
```

**Notes**:

- Only provide translations for languages you want to set/update
- You don't need to provide all supported languages
- English (`en`) translation is required
- Empty or missing translations will be returned as empty strings in GET responses

**Response Schema**:

```json
{
  "code": "string",
  "error": boolean,
  "message": "string",
  "data": {
    "id": "string",
    "nameTranslations": {
      "en": "string",
      "ar": "string",
      "fr": "string"
    },
    "isActive": boolean,
    "createdAt": "ISO-8601 datetime",
    "updatedAt": "ISO-8601 datetime",
    "createdBy": "string",
    "updatedBy": "string"
  },
  "metadata": null
}
```

**Example Response**:

```json
{
  "code": "200",
  "error": false,
  "message": "City created successfully",
  "data": {
    "id": "city-789",
    "nameTranslations": {
      "en": "Tangier",
      "ar": "طنجة",
      "fr": "Tanger",
      "es": "Tánger"
    },
    "isActive": true,
    "createdAt": "2025-11-08T15:30:00",
    "updatedAt": "2025-11-08T15:30:00",
    "createdBy": "admin@example.com",
    "updatedBy": "admin@example.com"
  },
  "metadata": null
}
```

**Validation Rules**:

- At least one translation must be provided
- `nameTranslations` cannot be null or empty
- Each translation value cannot exceed 100 characters

---

#### 3. Update City

**Endpoint**: `PUT /api/v1/cities/{id}`  
**Auth**: Required (ADMIN)  
**Description**: Update an existing city

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | City ID |

**Request Body Schema**:

```json
{
  "nameTranslations": {
    "en": "string (optional)",
    "ar": "string (optional)",
    "fr": "string (optional)",
    "es": "string (optional)"
  },
  "isActive": boolean
}
```

**Request Example**:

```json
{
  "nameTranslations": {
    "ar": "الدار البيضاء المحدثة",
    "es": "Casablanca"
  },
  "isActive": true
}
```

**Notes**:

- Only provide translations you want to update
- You can update individual language translations without sending all languages
- To remove a translation, omit it from the request (it will remain unchanged)
- Empty or missing translations will be returned as empty strings in GET responses

**Response Schema**: Same as Create City response

**Example Response**:

```json
{
  "code": "200",
  "error": false,
  "message": "City updated successfully",
  "data": {
    "id": "city-123",
    "nameTranslations": {
      "en": "Casablanca",
      "ar": "الدار البيضاء المحدثة",
      "fr": "Casablanca",
      "es": "Casablanca"
    },
    "isActive": true,
    "createdAt": "2025-01-15T10:30:00",
    "updatedAt": "2025-11-08T16:45:00",
    "createdBy": "admin@example.com",
    "updatedBy": "admin@example.com"
  },
  "metadata": null
}
```

---

#### 4. Delete City

**Endpoint**: `DELETE /api/v1/cities/{id}`  
**Auth**: Required (ADMIN)  
**Description**: Delete a city and all its translations

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | City ID |

**Response Schema**:

```json
{
  "code": "string",
  "error": boolean,
  "message": "string",
  "data": null,
  "metadata": null
}
```

**Example Response**:

```json
{
  "code": "200",
  "error": false,
  "message": "City deleted successfully",
  "data": null,
  "metadata": null
}
```

---

### Error Responses

#### 400 Bad Request

```json
{
  "code": "400",
  "error": true,
  "message": "Validation error message",
  "data": null,
  "metadata": null
}
```

#### 401 Unauthorized

```json
{
  "code": "401",
  "error": true,
  "message": "Unauthorized - Invalid or missing token",
  "data": null,
  "metadata": null
}
```

#### 403 Forbidden

```json
{
  "code": "403",
  "error": true,
  "message": "Access denied - Admin role required",
  "data": null,
  "metadata": null
}
```

#### 404 Not Found

```json
{
  "code": "404",
  "error": true,
  "message": "City not found with ID: {id}",
  "data": null,
  "metadata": null
}
```

#### 500 Internal Server Error

```json
{
  "code": "500",
  "error": true,
  "message": "Internal server error",
  "data": null,
  "metadata": null
}
```

---

### Translation System Notes

1. **Response Format**: GET endpoints return translations for ALL languages defined in the `supported_languages` collection
2. **Empty Translations**: If a translation doesn't exist for a language, an empty string (`""`) is returned in GET responses
3. **Request Format**: When creating/updating, only provide translations for languages you want to set/update
4. **Partial Updates**: Update endpoints only modify the translations you provide; other translations remain unchanged
5. **Language Codes**: Use standard ISO 639-1 codes (e.g., `en`, `ar`, `fr`, `es`)
6. **No Default Language**: The system treats all languages equally; there's no concept of a "default" or "primary" language

---

### Integration Checklist for React Dashboard

- [ ] Set up API client with base URL and authentication interceptor
- [ ] Implement JWT token storage and refresh mechanism
- [ ] Create city list component with filtering (active/inactive/all)
- [ ] Implement create city form with multi-language support
  - [ ] Fetch supported languages from languages API
  - [ ] Create input fields for each supported language
  - [ ] Make English (`en`) field required, others optional
- [ ] Implement edit city form with multi-language support
  - [ ] Pre-populate all language fields (including empty strings as empty inputs)
  - [ ] Allow partial updates (only send changed translations)
  - [ ] Handle empty translations gracefully
- [ ] Add delete city confirmation dialog
- [ ] Display all supported languages in forms
- [ ] Show empty translations as editable empty input fields
- [ ] Implement proper error handling for all endpoints
- [ ] Add loading states for all API calls
- [ ] Implement optimistic UI updates where appropriate
- [ ] Add audit information display (createdBy, updatedBy, timestamps)
- [ ] Show all language translations in city list/detail views

---

## 🌐 Supported Languages Management

### Base URL

```
/api/v1/supported-languages
```

### Authentication

- **Public endpoint** (`GET /`) does not require authentication
- **Admin endpoints** require:
  - **Header**: `Authorization: Bearer {JWT_TOKEN}`
  - **Role**: `ADMIN`

---

### Endpoints

#### 1. Get All Supported Languages (Public)

**Endpoint**: `GET /api/v1/supported-languages`  
**Auth**: Not required  
**Description**: Retrieve all supported languages without audit fields (for public use)

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `isActive` | Boolean | No | Filter by active status. `true` = active only, `false` = inactive only, `null/omitted` = all |

**Response Schema**:

```json
{
  "code": "string",
  "error": boolean,
  "message": "string",
  "data": [
    {
      "id": "string",
      "code": "string",
      "name": "string",
      "isActive": boolean
    }
  ],
  "metadata": null
}
```

**Example Response**:

```json
{
  "code": "200",
  "error": false,
  "message": "Supported languages retrieved successfully",
  "data": [
    {
      "id": "lang-001",
      "code": "en",
      "name": "English",
      "isActive": true
    },
    {
      "id": "lang-002",
      "code": "ar",
      "name": "Arabic",
      "isActive": true
    },
    {
      "id": "lang-003",
      "code": "fr",
      "name": "French",
      "isActive": true
    },
    {
      "id": "lang-004",
      "code": "es",
      "name": "Spanish",
      "isActive": false
    }
  ],
  "metadata": null
}
```

**Usage Notes**:

- Use this endpoint to fetch available language codes when building translation forms
- Typically, filter by `isActive=true` to show only active languages to users
- No authentication required - safe for public use

---

#### 2. Get All Supported Languages (Admin)

**Endpoint**: `GET /api/v1/supported-languages/admin`  
**Auth**: Required (ADMIN)  
**Description**: Retrieve all supported languages with full details including audit fields

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `isActive` | Boolean | No | Filter by active status. `true` = active only, `false` = inactive only, `null/omitted` = all |

**Response Schema**:

```json
{
  "code": "string",
  "error": boolean,
  "message": "string",
  "data": [
    {
      "id": "string",
      "code": "string",
      "name": "string",
      "isActive": boolean,
      "createdAt": "ISO-8601 datetime",
      "updatedAt": "ISO-8601 datetime",
      "createdBy": "string",
      "updatedBy": "string"
    }
  ],
  "metadata": null
}
```

**Example Response**:

```json
{
  "code": "200",
  "error": false,
  "message": "Supported languages retrieved successfully",
  "data": [
    {
      "id": "lang-001",
      "code": "en",
      "name": "English",
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00",
      "updatedAt": "2025-01-01T00:00:00",
      "createdBy": "admin@example.com",
      "updatedBy": "admin@example.com"
    },
    {
      "id": "lang-002",
      "code": "ar",
      "name": "Arabic",
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00",
      "updatedAt": "2025-01-01T00:00:00",
      "createdBy": "admin@example.com",
      "updatedBy": "admin@example.com"
    }
  ],
  "metadata": null
}
```

---

#### 3. Create Supported Language

**Endpoint**: `POST /api/v1/supported-languages`  
**Auth**: Required (ADMIN)  
**Description**: Create a new supported language

**Request Body Schema**:

```json
{
  "code": "string (required, ISO 639-1 code)",
  "name": "string (required)",
  "isActive": boolean
}
```

**Request Example**:

```json
{
  "code": "de",
  "name": "German",
  "isActive": true
}
```

**Response Schema**:

```json
{
  "code": "string",
  "error": boolean,
  "message": "string",
  "data": {
    "id": "string",
    "code": "string",
    "name": "string",
    "isActive": boolean,
    "createdAt": "ISO-8601 datetime",
    "updatedAt": "ISO-8601 datetime",
    "createdBy": "string",
    "updatedBy": "string"
  },
  "metadata": null
}
```

**Example Response**:

```json
{
  "code": "200",
  "error": false,
  "message": "Supported language created successfully",
  "data": {
    "id": "lang-005",
    "code": "de",
    "name": "German",
    "isActive": true,
    "createdAt": "2025-11-09T10:00:00",
    "updatedAt": "2025-11-09T10:00:00",
    "createdBy": "admin@example.com",
    "updatedBy": "admin@example.com"
  },
  "metadata": null
}
```

**Validation Rules**:

- `code` must be a valid language code (typically ISO 639-1 format)
- `code` must be unique
- `name` is required and cannot be empty

---

#### 4. Update Supported Language

**Endpoint**: `PUT /api/v1/supported-languages/{id}`  
**Auth**: Required (ADMIN)  
**Description**: Update an existing supported language

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | Language ID |

**Request Body Schema**:

```json
{
  "code": "string (required)",
  "name": "string (required)",
  "isActive": boolean
}
```

**Request Example**:

```json
{
  "code": "en",
  "name": "English (US)",
  "isActive": true
}
```

**Response Schema**: Same as Create Supported Language response

**Example Response**:

```json
{
  "code": "200",
  "error": false,
  "message": "Supported language updated successfully",
  "data": {
    "id": "lang-001",
    "code": "en",
    "name": "English (US)",
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00",
    "updatedAt": "2025-11-09T11:30:00",
    "createdBy": "admin@example.com",
    "updatedBy": "admin@example.com"
  },
  "metadata": null
}
```

---

#### 5. Delete Supported Language

**Endpoint**: `DELETE /api/v1/supported-languages/{id}`  
**Auth**: Required (ADMIN)  
**Description**: Delete a supported language

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | Language ID |

**Response Schema**:

```json
{
  "code": "string",
  "error": boolean,
  "message": "string",
  "data": null,
  "metadata": null
}
```

**Example Response**:

```json
{
  "code": "200",
  "error": false,
  "message": "Supported language deleted successfully",
  "data": null,
  "metadata": null
}
```

**Important Notes**:

- Deleting a language will affect all entities using that language for translations
- Consider setting `isActive=false` instead of deleting to preserve existing translations

---

### Integration Checklist for React Dashboard

- [ ] Fetch supported languages on app initialization using public endpoint
- [ ] Cache supported languages list in global state (Redux/Context)
- [ ] Create language management list component (admin only)
- [ ] Implement create language form with code and name validation
- [ ] Implement edit language form
- [ ] Add delete language confirmation with warning about translation impact
- [ ] Use language codes dynamically when building translation forms for other entities
- [ ] Filter by `isActive=true` for user-facing forms
- [ ] Show all languages (including inactive) in admin language management
- [ ] Display active/inactive status with visual indicators
- [ ] Add loading states for all API calls
- [ ] Implement proper error handling

---

## � Image Upload Management

### Base URL

```
/api/v1/images
```

### Authentication

- **Upload endpoint** requires authentication with one of these roles:
  - **USER** - For profile pictures
  - **ACTIVITY** - For activity images
  - **ADMIN** - For all entity images (hotels, cities, stadiums, etc.)
- **Delete endpoint** requires:
  - **Role**: `ADMIN` only

---

### Endpoints

#### 1. Upload Image

**Endpoint**: `POST /api/v1/images/upload`  
**Auth**: Required (USER, ACTIVITY, or ADMIN)  
**Content-Type**: `multipart/form-data`  
**Description**: Upload a single image and get the public URL to use in entity creation/update

**Form Data Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | Yes | Image file (jpg, jpeg, png, gif, webp, bmp) |
| `subdirectory` | String | No | Optional subdirectory path (e.g., 'profiles', 'activities', 'hotels', 'cities') |

**Validation Rules**:

- Maximum file size: **5MB**
- Allowed formats: jpg, jpeg, png, gif, webp, bmp
- File must be a valid image (checked by content-type)

**Response Schema**:

```json
{
  "code": "string",
  "error": boolean,
  "message": "string",
  "data": {
    "imageUrl": "string"
  },
  "metadata": null
}
```

**Example Request** (using curl):

```bash
curl -X POST http://localhost:8080/api/v1/images/upload \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -F "file=@/path/to/image.jpg" \
  -F "subdirectory=activities"
```

**Example Response**:

```json
{
  "code": "201",
  "error": false,
  "message": "Image uploaded successfully",
  "data": {
    "imageUrl": "/uploads/public/activities/a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg"
  },
  "metadata": null
}
```

**Usage Flow**:

1. Upload image first to get the URL
2. Use the returned `imageUrl` in your entity creation/update request
3. Example for activity creation:

```json
{
  "titleTranslations": { "en": "Desert Safari" },
  "descriptionTranslations": { "en": "Amazing desert experience" },
  "imageUrls": [
    "/uploads/public/activities/a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg",
    "/uploads/public/activities/b2c3d4e5-f6a7-8901-bcde-f12345678901.jpg"
  ]
  // ... other fields
}
```

---

#### 2. Delete Image

**Endpoint**: `DELETE /api/v1/images`  
**Auth**: Required (ADMIN only)  
**Description**: Delete an image from the server. Only administrators can delete images to prevent accidental deletion of images used by other entities.

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `imageUrl` | String | Yes | Full image URL to delete (e.g., `/uploads/public/activities/abc123.jpg`) |

**Response Schema**:

```json
{
  "code": "string",
  "error": boolean,
  "message": "string",
  "data": null,
  "metadata": null
}
```

**Example Request**:

```bash
curl -X DELETE "http://localhost:8080/api/v1/images?imageUrl=/uploads/public/activities/abc123.jpg" \
  -H "Authorization: Bearer {ADMIN_JWT_TOKEN}"
```

**Example Response**:

```json
{
  "code": "200",
  "error": false,
  "message": "Image deleted successfully",
  "data": null,
  "metadata": null
}
```

---

### Image Management Best Practices

#### For Users (USER role)

1. **Profile Picture Upload**:
   - Upload new image: `POST /upload?subdirectory=profiles`
   - Get the URL and update user profile
   - Old profile picture remains on server (admin can clean up later)

#### For Activity Users (ACTIVITY role)

1. **Activity Image Upload**:
   - Upload images one by one: `POST /upload?subdirectory=activities`
   - Collect all image URLs
   - Create/update activity with array of image URLs
   - Old images remain on server when updating

#### For Admins (ADMIN role)

1. **Entity Image Upload** (hotels, cities, stadiums, etc.):
   - Upload images: `POST /upload?subdirectory=hotels` (or cities, stadiums, etc.)
   - Use returned URLs in entity creation/update
2. **Image Cleanup**:
   - Use `DELETE /images?imageUrl=...` to remove unused images
   - Recommended: Implement periodic cleanup of orphaned images

---

### Subdirectory Organization

**Recommended subdirectory structure**:

- `profiles` - User profile pictures
- `activities` - Activity images
- `hotels` - Hotel images
- `cities` - City images (if needed)
- `stadiums` - Stadium images
- `tourist-spots` - Tourist spot images
- `visas` - Visa-related images

**Path Traversal Protection**: The API validates subdirectories to prevent malicious paths (e.g., `../../../etc`)

---

### Error Responses

#### 400 Bad Request - Invalid File

```json
{
  "code": "400",
  "error": true,
  "message": "Only image files are allowed",
  "data": null,
  "metadata": null
}
```

#### 400 Bad Request - File Too Large

```json
{
  "code": "400",
  "error": true,
  "message": "File exceeds the maximum allowed size of 5MB",
  "data": null,
  "metadata": null
}
```

#### 400 Bad Request - Invalid Format

```json
{
  "code": "400",
  "error": true,
  "message": "Unsupported image format. Allowed formats: jpg, jpeg, png, gif, webp, bmp",
  "data": null,
  "metadata": null
}
```

#### 401 Unauthorized

```json
{
  "code": "401",
  "error": true,
  "message": "Unauthorized - Invalid or missing token",
  "data": null,
  "metadata": null
}
```

#### 403 Forbidden

```json
{
  "code": "403",
  "error": true,
  "message": "Access denied - Insufficient permissions",
  "data": null,
  "metadata": null
}
```

---

### Integration Checklist for React Dashboard

#### For All Users

- [ ] Implement image upload with file picker component
- [ ] Show upload progress indicator
- [ ] Display image preview before/after upload
- [ ] Handle max file size validation on frontend (5MB)
- [ ] Accept only image formats (jpg, jpeg, png, gif, webp, bmp)
- [ ] Store returned image URLs in component state
- [ ] Display uploaded images with delete/replace options

#### For Profile Pictures (USER role)

- [ ] Single image upload for profile
- [ ] Crop/resize functionality (optional)
- [ ] Show current profile picture with option to change
- [ ] Update user profile API call with new imageUrl

#### For Activity Images (ACTIVITY role)

- [ ] Multiple image upload support
- [ ] Drag & drop interface for images
- [ ] Image reordering functionality
- [ ] Display array of image URLs in activity form
- [ ] Include imageUrls array in activity creation/update

#### For Admin Dashboard (ADMIN role)

- [ ] Same as activity images for entities (hotels, cities, etc.)
- [ ] Add "Delete Image" button on image management page
- [ ] Implement orphaned image detection (images not used by any entity)
- [ ] Bulk delete functionality for cleanup

---

## 📞 Contacts Management

### Base URL

```
/api/v1/contacts
```

### Authentication

- Public endpoint (`GET /`) - No authentication required
- Admin endpoints - Require `Authorization: Bearer {JWT_TOKEN}` with `ADMIN` role

---

### Endpoints

#### 1. Get All Contacts (Public)

**Endpoint**: `GET /api/v1/contacts`  
**Auth**: None (Public)  
**Description**: Retrieve all contacts with translations in all supported languages (no audit fields)

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `isActive` | Boolean | No | Filter by active status. `true` = active only, `false` = inactive only, `null/omitted` = all |

**Success Response**: `200 OK`

```json
{
  "code": "200",
  "error": false,
  "message": "Contacts retrieved successfully",
  "data": [
    {
      "id": "contact123",
      "nameTranslations": {
        "en": "Customer Support",
        "ar": "دعم العملاء",
        "fr": "Support Client"
      },
      "link": "mailto:support@example.com",
      "icon": "https://example.com/icons/email.png",
      "isActive": true
    }
  ],
  "metadata": null
}
```

**Response Schema**:
| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique contact identifier |
| `nameTranslations` | Object | Contact name in all supported languages (empty string if missing) |
| `link` | String | Contact link (URL, email, phone) |
| `icon` | String | Icon URL for the contact |
| `isActive` | Boolean | Whether the contact is active |

---

#### 2. Get All Contacts (Admin)

**Endpoint**: `GET /api/v1/contacts/admin`  
**Auth**: Required (ADMIN)  
**Description**: Retrieve all contacts with translations in all supported languages (includes audit fields)

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `isActive` | Boolean | No | Filter by active status. `true` = active only, `false` = inactive only, `null/omitted` = all |

**Success Response**: `200 OK`

```json
{
  "code": "200",
  "error": false,
  "message": "Contacts retrieved successfully",
  "data": [
    {
      "id": "contact123",
      "nameTranslations": {
        "en": "Customer Support",
        "ar": "دعم العملاء",
        "fr": "Support Client"
      },
      "link": "mailto:support@example.com",
      "icon": "https://example.com/icons/email.png",
      "isActive": true,
      "createdAt": "2025-11-08T15:30:00",
      "updatedAt": "2025-11-09T10:20:00",
      "createdBy": "admin@example.com",
      "updatedBy": "admin@example.com"
    }
  ],
  "metadata": null
}
```

**Response Schema**:
| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique contact identifier |
| `nameTranslations` | Object | Contact name in all supported languages (empty string if missing) |
| `link` | String | Contact link (URL, email, phone) |
| `icon` | String | Icon URL for the contact |
| `isActive` | Boolean | Whether the contact is active |
| `createdAt` | LocalDateTime | Timestamp when created |
| `updatedAt` | LocalDateTime | Timestamp when last updated |
| `createdBy` | String | Email of user who created |
| `updatedBy` | String | Email of user who last updated |

---

#### 3. Create Contact

**Endpoint**: `POST /api/v1/contacts`  
**Auth**: Required (ADMIN)  
**Description**: Create a new contact with translations

**Request Body**:

```json
{
  "nameTranslations": {
    "en": "Customer Support",
    "ar": "دعم العملاء",
    "fr": "Support Client"
  },
  "link": "mailto:support@example.com",
  "icon": "https://example.com/icons/email.png",
  "isActive": true
}
```

**Request Schema**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `nameTranslations` | Object | Yes | Contact name in multiple languages. At least one language required. |
| `link` | String | Yes | Contact link (URL, email, phone) |
| `icon` | String | No | Icon URL for the contact |
| `isActive` | Boolean | No | Whether the contact is active (default: true) |

**Success Response**: `201 Created`

```json
{
  "code": "201",
  "error": false,
  "message": "Contact created successfully",
  "data": {
    "id": "contact123",
    "nameTranslations": {
      "en": "Customer Support",
      "ar": "دعم العملاء",
      "fr": "Support Client"
    },
    "link": "mailto:support@example.com",
    "icon": "https://example.com/icons/email.png",
    "isActive": true,
    "createdAt": "2025-11-09T15:30:00",
    "updatedAt": "2025-11-09T15:30:00",
    "createdBy": "admin@example.com",
    "updatedBy": "admin@example.com"
  },
  "metadata": null
}
```

**Error Responses**:

- `400 Bad Request`: Invalid request body or missing required fields
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: User does not have ADMIN role

---

#### 4. Update Contact

**Endpoint**: `PUT /api/v1/contacts/{id}`  
**Auth**: Required (ADMIN)  
**Description**: Update an existing contact

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | Contact ID |

**Request Body**:

```json
{
  "nameTranslations": {
    "en": "Customer Support Updated",
    "ar": "دعم العملاء المحدث"
  },
  "link": "mailto:newsupport@example.com",
  "icon": "https://example.com/icons/new-email.png",
  "isActive": false
}
```

**Request Schema**: Same as Create Contact

**Success Response**: `200 OK`

```json
{
  "code": "200",
  "error": false,
  "message": "Contact updated successfully",
  "data": {
    "id": "contact123",
    "nameTranslations": {
      "en": "Customer Support Updated",
      "ar": "دعم العملاء المحدث",
      "fr": ""
    },
    "link": "mailto:newsupport@example.com",
    "icon": "https://example.com/icons/new-email.png",
    "isActive": false,
    "createdAt": "2025-11-08T15:30:00",
    "updatedAt": "2025-11-09T16:00:00",
    "createdBy": "admin@example.com",
    "updatedBy": "admin@example.com"
  },
  "metadata": null
}
```

**Error Responses**:

- `400 Bad Request`: Invalid request body
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: User does not have ADMIN role
- `404 Not Found`: Contact with specified ID not found

---

#### 5. Delete Contact

**Endpoint**: `DELETE /api/v1/contacts/{id}`  
**Auth**: Required (ADMIN)  
**Description**: Delete a contact

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | Contact ID |

**Success Response**: `200 OK`

```json
{
  "code": "200",
  "error": false,
  "message": "Contact deleted successfully",
  "data": null,
  "metadata": null
}
```

**Error Responses**:

- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: User does not have ADMIN role
- `404 Not Found`: Contact with specified ID not found

---

### Usage Notes

1. **Translation Handling**:

   - All GET responses return translations in ALL supported languages
   - Missing translations appear as empty strings (`""`)
   - POST/PUT requests only need to include the languages you want to create/update
   - Unspecified languages in updates will remain unchanged

2. **No Default Language**: All languages are treated equally. There is no concept of a "default" language.

3. **Link Format**: The `link` field can be:

   - Email: `mailto:email@example.com`
   - Phone: `tel:+1234567890`
   - URL: `https://example.com`
   - Any other URI format

4. **Icon URL**: Should be a publicly accessible image URL. Recommended formats: PNG, SVG, JPG

5. **Active Status Filter**:

   - `?isActive=true` - Returns only active contacts
   - `?isActive=false` - Returns only inactive contacts
   - No parameter or `null` - Returns all contacts

6. **Public vs Admin Endpoints**:
   - Public endpoint (`GET /`) - No authentication, no audit fields (createdAt, updatedAt, etc.)
   - Admin endpoint (`GET /admin`) - Requires authentication, includes all audit fields

---

## � Hotels Management

### Base URL

```
/api/v1/hotels
```

### Authentication

- Public endpoint (`GET /`) - No authentication required
- Admin endpoints - Require `Authorization: Bearer {JWT_TOKEN}` with `ADMIN` role

---

### Endpoints

#### 1. Get All Hotels (Public)

**Endpoint**: `GET /api/v1/hotels`  
**Auth**: None (Public)  
**Description**: Retrieve all hotels with translations in all supported languages (no audit fields)

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `isActive` | Boolean | No | Filter by active status. `true` = active only, `false` = inactive only, `null/omitted` = all |

**Success Response**: `200 OK`

```json
{
  "code": "200",
  "error": false,
  "message": "Hotels retrieved successfully",
  "data": [
    {
      "id": "hotel123",
      "nameTranslations": {
        "en": "Grand Hotel",
        "ar": "الفندق الكبير",
        "fr": "Grand Hôtel",
        "es": ""
      },
      "descriptionTranslations": {
        "en": "Luxury hotel in the heart of the city",
        "ar": "فندق فاخر في قلب المدينة",
        "fr": "Hôtel de luxe au cœur de la ville",
        "es": ""
      },
      "cityId": "city123",
      "location": {
        "latitude": 33.5731,
        "longitude": -7.5898
      },
      "images": [
        {
          "url": "https://example.com/hotel1.jpg",
          "alt": "Hotel exterior"
        }
      ],
      "minPrice": 150.0,
      "likesCount": 245,
      "isActive": true,
      "isLikedByUser": false,
      "isBookmarkedByUser": false,
      "rating": 4.5,
      "ratingCount": 120
    }
  ],
  "metadata": null
}
```

**Response Schema**:
| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique hotel identifier |
| `nameTranslations` | Object | Hotel name in all supported languages (empty string if missing) |
| `descriptionTranslations` | Object | Hotel description in all supported languages (empty string if missing) |
| `cityId` | String | ID of the city where the hotel is located |
| `location` | Object | GPS coordinates (latitude, longitude) |
| `images` | Array | List of hotel images with URL and alt text |
| `minPrice` | Double | Minimum room price |
| `likesCount` | Integer | Number of likes |
| `isActive` | Boolean | Whether the hotel is active |
| `isLikedByUser` | Boolean | Whether current user liked this hotel (always false for public endpoint) |
| `isBookmarkedByUser` | Boolean | Whether current user bookmarked this hotel (always false for public endpoint) |
| `rating` | Double | Average rating from approved reviews (0.0 if no reviews) |
| `ratingCount` | Integer | Total number of approved reviews |

---

#### 2. Get All Hotels (Admin)

**Endpoint**: `GET /api/v1/hotels/admin`  
**Auth**: Required (ADMIN)  
**Description**: Retrieve all hotels with translations in all supported languages (includes audit fields)

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `isActive` | Boolean | No | Filter by active status. `true` = active only, `false` = inactive only, `null/omitted` = all |

**Success Response**: `200 OK`

```json
{
  "code": "200",
  "error": false,
  "message": "Hotels retrieved successfully",
  "data": [
    {
      "id": "hotel123",
      "nameTranslations": {
        "en": "Grand Hotel",
        "ar": "الفندق الكبير",
        "fr": "Grand Hôtel",
        "es": ""
      },
      "descriptionTranslations": {
        "en": "Luxury hotel in the heart of the city",
        "ar": "فندق فاخر في قلب المدينة",
        "fr": "Hôtel de luxe au cœur de la ville",
        "es": ""
      },
      "cityId": "city123",
      "location": {
        "latitude": 33.5731,
        "longitude": -7.5898
      },
      "images": [
        {
          "url": "https://example.com/hotel1.jpg",
          "alt": "Hotel exterior"
        }
      ],
      "minPrice": 150.0,
      "likesCount": 245,
      "isActive": true,
      "rating": 4.5,
      "ratingCount": 120,
      "createdAt": "2025-11-08T15:30:00",
      "updatedAt": "2025-11-09T16:00:00",
      "createdBy": "admin@example.com",
      "updatedBy": "admin@example.com"
    }
  ],
  "metadata": null
}
```

**Response Schema**: Same as public endpoint plus:
| Field | Type | Description |
|-------|------|-------------|
| `createdAt` | ISO-8601 | Creation timestamp |
| `updatedAt` | ISO-8601 | Last update timestamp |
| `createdBy` | String | Email of user who created the hotel |
| `updatedBy` | String | Email of user who last updated the hotel |

---

#### 3. Create Hotel

**Endpoint**: `POST /api/v1/hotels`  
**Auth**: Required (ADMIN)  
**Description**: Create a new hotel with translations (only English required during creation)

**Request Body**:

```json
{
  "nameTranslations": {
    "en": "Grand Hotel"
  },
  "descriptionTranslations": {
    "en": "Luxury hotel in the heart of the city"
  },
  "cityId": "city123",
  "location": {
    "latitude": 33.5731,
    "longitude": -7.5898
  },
  "images": [
    {
      "url": "https://example.com/hotel1.jpg",
      "alt": "Hotel exterior"
    }
  ],
  "minPrice": 150.0
}
```

**Request Schema**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `nameTranslations` | Object | Yes | Hotel name (only `en` required) |
| `descriptionTranslations` | Object | Yes | Hotel description (only `en` required) |
| `cityId` | String | Yes | ID of the city |
| `location` | Object | Yes | GPS coordinates with latitude and longitude |
| `images` | Array | No | List of images (url and alt text) |
| `minPrice` | Double | No | Minimum room price |

**Success Response**: `201 Created`

```json
{
  "code": "201",
  "error": false,
  "message": "Hotel created successfully",
  "data": {
    "id": "hotel123",
    "nameTranslations": {
      "en": "Grand Hotel",
      "ar": "",
      "fr": "",
      "es": ""
    },
    "descriptionTranslations": {
      "en": "Luxury hotel in the heart of the city",
      "ar": "",
      "fr": "",
      "es": ""
    },
    "cityId": "city123",
    "location": {
      "latitude": 33.5731,
      "longitude": -7.5898
    },
    "images": [
      {
        "url": "https://example.com/hotel1.jpg",
        "alt": "Hotel exterior"
      }
    ],
    "minPrice": 150.0,
    "likesCount": 0,
    "isActive": false,
    "rating": 0.0,
    "ratingCount": 0,
    "createdAt": "2025-11-09T10:00:00",
    "updatedAt": "2025-11-09T10:00:00",
    "createdBy": "admin@example.com",
    "updatedBy": "admin@example.com"
  },
  "metadata": null
}
```

**Error Responses**:

- `400 Bad Request`: Invalid request body or validation error
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: User does not have ADMIN role
- `404 Not Found`: City with specified ID not found

**Notes**:

- Hotels are created as **inactive by default** (`isActive: false`)
- Only English (`en`) translation is required during creation
- Other languages can be added later via PUT endpoint
- Rating is 0.0 initially (no reviews yet)

---

#### 4. Update Hotel

**Endpoint**: `PUT /api/v1/hotels/{id}`  
**Auth**: Required (ADMIN)  
**Description**: Update an existing hotel (can add/update translations, can activate if all translations complete)

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | Hotel ID |

**Request Body** (all fields optional):

```json
{
  "nameTranslations": {
    "ar": "الفندق الكبير",
    "fr": "Grand Hôtel"
  },
  "descriptionTranslations": {
    "ar": "فندق فاخر في قلب المدينة",
    "fr": "Hôtel de luxe au cœur de la ville"
  },
  "cityId": "city456",
  "location": {
    "latitude": 33.5731,
    "longitude": -7.5898
  },
  "images": [
    {
      "url": "https://example.com/hotel-new.jpg",
      "alt": "New hotel image"
    }
  ],
  "minPrice": 200.0,
  "isActive": true
}
```

**Request Schema**: All fields are optional
| Field | Type | Description |
|-------|------|-------------|
| `nameTranslations` | Object | Update name translations (only specified languages updated) |
| `descriptionTranslations` | Object | Update description translations (only specified languages updated) |
| `cityId` | String | Update city |
| `location` | Object | Update GPS coordinates |
| `images` | Array | Update images (replaces existing) |
| `minPrice` | Double | Update minimum price |
| `isActive` | Boolean | Activate/deactivate hotel (requires all language translations to be complete) |

**Success Response**: `200 OK`

```json
{
  "code": "200",
  "error": false,
  "message": "Hotel updated successfully",
  "data": {
    "id": "hotel123",
    "nameTranslations": {
      "en": "Grand Hotel",
      "ar": "الفندق الكبير",
      "fr": "Grand Hôtel",
      "es": ""
    },
    "descriptionTranslations": {
      "en": "Luxury hotel in the heart of the city",
      "ar": "فندق فاخر في قلب المدينة",
      "fr": "Hôtel de luxe au cœur de la ville",
      "es": ""
    },
    "cityId": "city456",
    "location": {
      "latitude": 33.5731,
      "longitude": -7.5898
    },
    "images": [
      {
        "url": "https://example.com/hotel-new.jpg",
        "alt": "New hotel image"
      }
    ],
    "minPrice": 200.0,
    "likesCount": 245,
    "isActive": true,
    "rating": 4.5,
    "ratingCount": 120,
    "createdAt": "2025-11-08T15:30:00",
    "updatedAt": "2025-11-09T16:00:00",
    "createdBy": "admin@example.com",
    "updatedBy": "admin@example.com"
  },
  "metadata": null
}
```

**Error Responses**:

- `400 Bad Request`: Invalid request body, validation error, or incomplete translations when trying to activate
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: User does not have ADMIN role
- `404 Not Found`: Hotel or City not found

---

### Usage Notes

1. **Translation Handling**:

   - All GET responses return translations in ALL supported languages
   - Missing translations appear as empty strings (`""`)
   - POST requires only English (`en`) translation
   - PUT only needs to include the languages you want to update
   - Unspecified languages in updates will remain unchanged

2. **No Default Language**: All languages are treated equally. There is no concept of a "default" language.

3. **Activation Rules**:

   - Hotels are created as **inactive** (`isActive: false`) by default
   - To activate a hotel, ALL supported languages must have translations for both name and description
   - If translations are incomplete, activation will fail with error code `INCOMPLETE_TRANSLATIONS`

4. **Location Validation**: Both latitude and longitude are required and must be valid coordinates

5. **Images**:

   - Array of objects with `url` and `alt` fields
   - URLs should be publicly accessible
   - When updating, the entire images array is replaced

6. **Rating System**:

   - `rating`: Average rating calculated from approved reviews (0.0 to 5.0)
   - `ratingCount`: Total number of approved reviews
   - New hotels start with rating 0.0 and ratingCount 0
   - Ratings are automatically calculated from the reviews feature

7. **User Interaction Fields** (Public endpoint only):

   - `isLikedByUser`: Always false for public endpoint (requires user authentication to be implemented)
   - `isBookmarkedByUser`: Always false for public endpoint (requires user authentication to be implemented)

8. **Active Status Filter**:

   - `?isActive=true` - Returns only active hotels
   - `?isActive=false` - Returns only inactive hotels
   - No parameter or `null` - Returns all hotels

9. **Public vs Admin Endpoints**:
   - Public endpoint (`GET /`) - No authentication, includes user interaction fields (isLikedByUser, isBookmarkedByUser)
   - Admin endpoint (`GET /admin`) - Requires authentication, includes all audit fields but no user interaction fields

---

## �🌐 Translations Management

### Base URL

```
/api/v1/translations
```

### Authentication

All endpoints require:

- **Header**: `Authorization: Bearer {JWT_TOKEN}`
- **Role**: `ADMIN`

---

### Endpoints

#### 1. Upsert Field Translations

**Endpoint**: `PUT /api/v1/translations/entity/{entityType}/{entityId}/field/{fieldName}`  
**Auth**: Required (ADMIN)  
**Description**: Create or update translations for a specific field of an entity. If translations already exist for a language, they will be updated; otherwise, new translations will be created.

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `entityType` | String | Yes | Type of entity (e.g., "city", "hotel", "activity", "stadium", "tourist_spot", "contact") |
| `entityId` | String | Yes | ID of the entity |
| `fieldName` | String | Yes | Name of the field being translated (e.g., "name", "description", "address") |

**Request Body**:

```json
{
  "translations": {
    "en": "English text",
    "ar": "النص العربي",
    "fr": "Texte français"
  }
}
```

**Request Schema**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `translations` | Object | Yes | Map of language codes to translated text. Only include languages you want to create/update. |

**Success Response**: `200 OK`

```json
{
  "code": "200",
  "error": false,
  "message": "Field translations upserted successfully",
  "data": "Translations saved",
  "metadata": null
}
```

**Error Responses**:

- `400 Bad Request`: Invalid language code or missing required fields
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: User does not have ADMIN role

---

#### 2. Get All Translations (Grouped)

**Endpoint**: `GET /api/v1/translations/grouped`  
**Auth**: Required (ADMIN)  
**Description**: Retrieve all translations in the system, grouped by entity type → entity ID → field name → language code

**Success Response**: `200 OK`

```json
{
  "code": "200",
  "error": false,
  "message": "All translations retrieved successfully",
  "data": {
    "city": {
      "cityId123": {
        "name": {
          "en": "Paris",
          "ar": "باريس",
          "fr": "Paris"
        }
      }
    },
    "hotel": {
      "hotelId456": {
        "name": {
          "en": "Grand Hotel",
          "ar": "الفندق الكبير"
        },
        "description": {
          "en": "A luxury hotel in the city center",
          "ar": "فندق فاخر في وسط المدينة"
        }
      }
    }
  },
  "metadata": null
}
```

**Response Structure**:

- The `data` object has four levels of nesting:
  1. **Entity Type** (e.g., "city", "hotel", "activity")
  2. **Entity ID** (the specific entity's ID)
  3. **Field Name** (e.g., "name", "description", "address")
  4. **Language Code → Translation Text** mapping

---

### Usage Notes

1. **Entity Types**: Valid entity types include:

   - `city` - For city name translations
   - `hotel` - For hotel name and description translations
   - `activity` - For activity title and description translations
   - `stadium` - For stadium name and description translations
   - `tourist_spot` - For tourist spot name, description, and address translations
   - `contact` - For contact name translations

2. **Field Names**: Common field names include:

   - `name` - Entity name
   - `title` - Activity title
   - `description` - Detailed description
   - `address` - Physical address (for tourist spots)

3. **Language Codes**: Must be valid supported language codes. Fetch available languages from `GET /api/v1/supported-languages?isActive=true`

4. **Partial Updates**: When using `PUT /api/v1/translations/entity/{entityType}/{entityId}/field/{fieldName}`, you can include only the languages you want to update. Other existing translations will remain unchanged.

5. **No Default Language**: All languages are treated equally. There is no concept of a "default" or "primary" language.

6. **Validation**:

   - Invalid language keys like "country", "nationality", "name", "description", "address", "text", "default_language" will be filtered out
   - Empty or null translations are ignored

7. **Automatic Creation**: Most entity creation/update endpoints handle translation saving automatically. You typically don't need to call the translations API directly unless you want to:

   - Update translations independently after entity creation
   - Bulk view all translations in the system
   - Fix or modify existing translations

8. **Direct Translation Management**: The translations feature is primarily for admin oversight and bulk operations. Individual entity endpoints (cities, hotels, activities, etc.) handle their own translations during create/update operations.

---

## 🎯 Activities Management

### Base URL

```
/api/v1/activities
```

### Authentication

- Public endpoint (`GET /`) - No authentication required
- Activity user endpoints - Require `Authorization: Bearer {JWT_TOKEN}` with `ACTIVITY` role
- Admin endpoints - Require `Authorization: Bearer {JWT_TOKEN}` with `ADMIN` role

---

### Endpoints

#### 1. Get All Activities Grouped by Users (Public)

**Endpoint**: `GET /api/v1/activities`  
**Auth**: None (Public)  
**Description**: Retrieve all activities grouped by activity users with translations in all supported languages

**Success Response**: `200 OK`

```json
{
  "code": "200",
  "error": false,
  "message": "Activities grouped by users retrieved successfully",
  "data": [
    {
      "id": "user123",
      "name": "Adventure Tours Morocco",
      "description": "Professional adventure tour operator",
      "bannerImage": "https://example.com/banner.jpg",
      "activities": [
        {
          "id": "activity123",
          "titleTranslations": {
            "en": "Desert Safari",
            "ar": "سفاري الصحراء",
            "fr": "Safari dans le désert",
            "es": ""
          },
          "descriptionTranslations": {
            "en": "Exciting desert adventure",
            "ar": "مغامرة صحراوية مثيرة",
            "fr": "Aventure passionnante dans le désert",
            "es": ""
          },
          "images": ["https://example.com/activity1.jpg"],
          "price": 150.0,
          "tags": ["adventure", "desert", "outdoor"],
          "likedByUser": false,
          "likesCount": 45,
          "bookmarkedByUser": false
        }
      ]
    }
  ],
  "metadata": null
}
```

#### 2. Get All Activities Grouped by Users (Admin)

**Endpoint**: `GET /api/v1/activities/admin`  
**Auth**: Required (ADMIN)  
**Description**: Retrieve all activities grouped by activity users with full audit information

#### 3. Get Activities for Authenticated User (Owner)

**Endpoint**: `GET /api/v1/activities/owner`  
**Auth**: Required (ACTIVITY role)  
**Description**: Retrieve all activities for the authenticated activity user

#### 4. Create Activity

**Endpoint**: `POST /api/v1/activities`  
**Auth**: Required (ACTIVITY role)  
**Description**: Create a new activity with translations (multiple languages allowed at creation)

#### 5. Update Activity

**Endpoint**: `PUT /api/v1/activities/{activityId}`  
**Auth**: Required (ACTIVITY role)  
**Description**: Update an existing activity (can add/update translations)

#### 6. Delete Activity

**Endpoint**: `DELETE /api/v1/activities/{activityId}`  
**Auth**: Required (ACTIVITY role)  
**Description**: Delete an activity

#### 7. Like/Unlike Activity

**Endpoint**: `POST /api/v1/activities/{activityId}/like`  
**Auth**: Required (USER role)  
**Description**: Like or unlike an activity

---

## 🏛️ Tourist Spots Management

### Base URL

```
/api/v1/tourist-spots
```

### Authentication

- **Public Endpoints**: `GET /api/v1/tourist-spots` (No authentication required)
- **Admin Endpoints**: All other endpoints require `ADMIN` role
- **User Endpoints**: `POST /api/v1/tourist-spots/{id}/like` requires `USER` role

---

### Endpoints

#### 1. Get All Public Tourist Spots

**Endpoint**: `GET /api/v1/tourist-spots`  
**Auth**: None (Public)  
**Description**: Retrieve all tourist spots with translations for public consumption. Returns all available translations without audit fields.

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `cityId` | String | No | Filter tourist spots by city ID |

**Response Schema**:

```json
{
  "code": "string",
  "error": boolean,
  "message": "string",
  "data": [
    {
      "id": "string",
      "nameTranslations": {
        "en": "string",
        "ar": "string",
        "fr": "string"
      },
      "descriptionTranslations": {
        "en": "string",
        "ar": "string",
        "fr": "string"
      },
      "addressTranslations": {
        "en": "string",
        "ar": "string",
        "fr": "string"
      },
      "cityNameTranslations": {
        "en": "string",
        "ar": "string",
        "fr": "string"
      },
      "imageData": [
        {
          "url": "string",
          "altText": "string",
          "owner": "string"
        }
      ],
      "location": {
        "latitude": number,
        "longitude": number
      },
      "likesCount": number,
      "isLikedByUser": boolean,
      "isBookmarkedByUser": boolean,
      "isFreeEntry": boolean,
      "rating": number,
      "ratingCount": number,
      "openingHours": "HH:mm:ss",
      "closingHours": "HH:mm:ss",
      "suggestedBy": "string"
    }
  ],
  "metadata": null
}
```

**Example Response**:

```json
{
  "code": "200",
  "error": false,
  "message": "Public tourist spots retrieved successfully",
  "data": [
    {
      "id": "spot-123",
      "nameTranslations": {
        "en": "Hassan II Mosque",
        "ar": "مسجد الحسن الثاني",
        "fr": "Mosquée Hassan II",
        "es": ""
      },
      "descriptionTranslations": {
        "en": "One of the largest mosques in Africa with stunning ocean views",
        "ar": "واحد من أكبر المساجد في أفريقيا مع إطلالات خلابة على المحيط",
        "fr": "L'une des plus grandes mosquées d'Afrique avec vue imprenable sur l'océan",
        "es": ""
      },
      "addressTranslations": {
        "en": "Boulevard de la Corniche",
        "ar": "شارع الكورنيش",
        "fr": "Boulevard de la Corniche",
        "es": ""
      },
      "cityNameTranslations": {
        "en": "Casablanca",
        "ar": "الدار البيضاء",
        "fr": "Casablanca",
        "es": ""
      },
      "imageData": [
        {
          "url": "https://storage.example.com/spots/hassan-mosque.jpg",
          "altText": "Hassan II Mosque exterior view",
          "owner": "admin@example.com"
        }
      ],
      "location": {
        "latitude": 33.6084,
        "longitude": -7.6328
      },
      "likesCount": 1247,
      "isLikedByUser": false,
      "isBookmarkedByUser": false,
      "isFreeEntry": false,
      "rating": 4.8,
      "ratingCount": 356,
      "openingHours": "09:00:00",
      "closingHours": "18:00:00",
      "suggestedBy": "AJIAPP"
    }
  ]
}
```

**Notes**:

- Empty translations are returned as empty strings (`""`)
- `isLikedByUser` and `isBookmarkedByUser` are placeholders (always `false` for now)
- `isFreeEntry` is the inverse of `isPaidEntry`
- Rating is calculated from approved reviews
- Time fields are in ISO 8601 time format (HH:mm:ss)

---

#### 2. Get All Tourist Spots (Admin)

**Endpoint**: `GET /api/v1/tourist-spots/admin`  
**Auth**: Required (ADMIN)  
**Description**: Retrieve all tourist spots with full details including audit fields and all translations

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `cityId` | String | No | Filter by city ID |
| `isActive` | Boolean | No | Filter by active status |

**Response Schema**:

```json
{
  "code": "string",
  "error": boolean,
  "message": "string",
  "data": [
    {
      "id": "string",
      "nameTranslations": {
        "en": "string",
        "ar": "string",
        "fr": "string"
      },
      "descriptionTranslations": {
        "en": "string",
        "ar": "string",
        "fr": "string"
      },
      "location": {
        "latitude": number,
        "longitude": number
      },
      "images": [
        {
          "url": "string",
          "altText": "string",
          "owner": "string"
        }
      ],
      "city": {
        "id": "string",
        "nameTranslations": {
          "en": "string",
          "ar": "string"
        },
        "isActive": boolean
      },
      "addressTranslations": {
        "en": "string",
        "ar": "string",
        "fr": "string"
      },
      "isPaidEntry": boolean,
      "likes": number,
      "openingTime": "HH:mm:ss",
      "closingTime": "HH:mm:ss",
      "isActive": boolean,
      "suggestedBy": "string",
      "createdAt": "ISO-8601 datetime",
      "updatedAt": "ISO-8601 datetime",
      "createdBy": "string",
      "updatedBy": "string"
    }
  ],
  "metadata": null
}
```

**Example Response**:

```json
{
  "code": "200",
  "error": false,
  "message": "Tourist spots retrieved successfully",
  "data": [
    {
      "id": "spot-123",
      "nameTranslations": {
        "en": "Hassan II Mosque",
        "ar": "مسجد الحسن الثاني",
        "fr": "Mosquée Hassan II",
        "es": ""
      },
      "descriptionTranslations": {
        "en": "One of the largest mosques in Africa",
        "ar": "واحد من أكبر المساجد في أفريقيا",
        "fr": "L'une des plus grandes mosquées d'Afrique",
        "es": ""
      },
      "location": {
        "latitude": 33.6084,
        "longitude": -7.6328
      },
      "images": [
        {
          "url": "https://storage.example.com/spots/hassan-mosque.jpg",
          "altText": "Hassan II Mosque",
          "owner": "admin@example.com"
        }
      ],
      "city": {
        "id": "city-123",
        "nameTranslations": {
          "en": "Casablanca",
          "ar": "الدار البيضاء",
          "fr": "Casablanca",
          "es": ""
        },
        "isActive": true
      },
      "addressTranslations": {
        "en": "Boulevard de la Corniche",
        "ar": "شارع الكورنيش",
        "fr": "Boulevard de la Corniche",
        "es": ""
      },
      "isPaidEntry": true,
      "likes": 1247,
      "openingTime": "09:00:00",
      "closingTime": "18:00:00",
      "isActive": true,
      "suggestedBy": "AJIAPP",
      "createdAt": "2025-01-20T10:30:00",
      "updatedAt": "2025-11-09T14:20:00",
      "createdBy": "admin@example.com",
      "updatedBy": "admin@example.com"
    }
  ]
}
```

---

#### 3. Create Tourist Spot

**Endpoint**: `POST /api/v1/tourist-spots`  
**Auth**: Required (ADMIN)  
**Description**: Create a new tourist spot with English translations only. Additional translations can be added via update.

**Request Body**:

```json
{
  "nameTranslations": {
    "en": "string (required)"
  },
  "descriptionTranslations": {
    "en": "string (required)"
  },
  "addressTranslations": {
    "en": "string (optional)"
  },
  "location": {
    "latitude": number,
    "longitude": number
  },
  "images": [
    {
      "url": "string",
      "altText": "string",
      "owner": "string"
    }
  ],
  "cityId": "string (required)",
  "isPaidEntry": boolean,
  "openingTime": "HH:mm:ss (optional)",
  "closingTime": "HH:mm:ss (optional)",
  "suggestedBy": "string (optional, defaults to 'AJIAPP')"
}
```

**Example Request**:

```json
{
  "nameTranslations": {
    "en": "Jardin Majorelle"
  },
  "descriptionTranslations": {
    "en": "Botanical garden and artist's landscape garden"
  },
  "addressTranslations": {
    "en": "Rue Yves Saint Laurent, Marrakech"
  },
  "location": {
    "latitude": 31.6416,
    "longitude": -8.0032
  },
  "images": [
    {
      "url": "https://storage.example.com/spots/majorelle.jpg",
      "altText": "Jardin Majorelle entrance",
      "owner": "admin@example.com"
    }
  ],
  "cityId": "city-456",
  "isPaidEntry": true,
  "openingTime": "08:00:00",
  "closingTime": "18:00:00",
  "suggestedBy": "AJIAPP"
}
```

**Response**: Returns `TouristSpotResponseDto` (same as admin GET response)

**Validation Rules**:

- Only English (`en`) translations are allowed at creation
- `nameTranslations.en` is required
- `descriptionTranslations.en` is required
- `cityId` must reference an existing city
- Location coordinates must be valid (latitude: -90 to 90, longitude: -180 to 180)
- Tourist spot is created with `isActive: false`

---

#### 4. Update Tourist Spot

**Endpoint**: `PUT /api/v1/tourist-spots/{id}`  
**Auth**: Required (ADMIN)  
**Description**: Update an existing tourist spot. Can add/update translations in any supported language.

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | Tourist spot ID |

**Request Body** (all fields optional):

```json
{
  "nameTranslations": {
    "ar": "string",
    "fr": "string"
  },
  "descriptionTranslations": {
    "ar": "string",
    "fr": "string"
  },
  "addressTranslations": {
    "ar": "string",
    "fr": "string"
  },
  "location": {
    "latitude": number,
    "longitude": number
  },
  "images": [
    {
      "url": "string",
      "altText": "string",
      "owner": "string"
    }
  ],
  "cityId": "string",
  "isPaidEntry": boolean,
  "openingTime": "HH:mm:ss",
  "closingTime": "HH:mm:ss",
  "isActive": boolean,
  "suggestedBy": "string"
}
```

**Example Request** (adding Arabic and French translations):

```json
{
  "nameTranslations": {
    "ar": "حديقة ماجوريل",
    "fr": "Jardin Majorelle"
  },
  "descriptionTranslations": {
    "ar": "حديقة نباتية وحديقة فنان",
    "fr": "Jardin botanique et jardin d'artiste"
  },
  "addressTranslations": {
    "ar": "شارع إيف سان لوران، مراكش",
    "fr": "Rue Yves Saint Laurent, Marrakech"
  }
}
```

**Response**: Returns `TouristSpotResponseDto`

**Validation Rules**:

- Translation keys must be supported languages only
- If attempting to set `isActive: true`, all required translations must be complete (name, description, address for all active languages)
- Location coordinates must be valid if provided
- Partial updates are supported (only include fields to update)

---

#### 5. Delete Tourist Spot

**Endpoint**: `DELETE /api/v1/tourist-spots/{id}`  
**Auth**: Required (ADMIN)  
**Description**: Delete a tourist spot permanently

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | Tourist spot ID |

**Response**:

```json
{
  "code": "200",
  "error": false,
  "message": "Tourist spot deleted successfully",
  "data": null,
  "metadata": null
}
```

---

#### 6. Like/Unlike Tourist Spot

**Endpoint**: `POST /api/v1/tourist-spots/{id}/like`  
**Auth**: Required (USER)  
**Description**: Like or unlike a tourist spot

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | Tourist spot ID |

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `isLike` | Boolean | Yes | `true` to like, `false` to unlike |

**Example Request**:

```
POST /api/v1/tourist-spots/spot-123/like?isLike=true
```

**Response**:

```json
{
  "code": "200",
  "error": false,
  "message": "Tourist spot liked successfully",
  "data": null,
  "metadata": null
}
```

---

### Tourist Spots - Key Features

1. **Translation Management**:

   - Creation requires only English translations
   - Updates allow adding/modifying any supported language
   - All GET responses return all translations (empty strings for missing)

2. **Activation Rules**:

   - Tourist spots are created inactive (`isActive: false`)
   - To activate, must have complete translations for: name, description, address
   - All active languages must have these translations

3. **Time Fields**:

   - Opening and closing times are optional
   - Stored in ISO 8601 time format (HH:mm:ss)
   - Example: "09:00:00", "18:30:00"

4. **Location**:

   - Uses GPS coordinates (latitude/longitude)
   - Validated on create/update

5. **Images**:

   - Array of image objects with URL, alt text, and owner
   - No built-in upload handling (URLs only)

6. **Rating System**:

   - Ratings calculated from approved reviews
   - Public endpoint includes rating and ratingCount
   - Based on 5-star review system

7. **City Association**:
   - Each tourist spot belongs to one city
   - Admin response includes full city object with translations
   - Public response includes city name translations

---

## 📋 Next Features

_To be documented in upcoming sections:_

- **Stadiums Management**
- **Reviews Management**
- **User Management**

---

## Common Patterns

### Pagination

_Not yet implemented - All endpoints return full lists_

### Sorting

_Not yet implemented_

### Search

_Not yet implemented_

---

## Notes for Developers

1. **Timestamp Format**: All timestamps are in LocalDateTime format (e.g., `2025-11-08T15:30:00`)
2. **Authentication**: Store JWT token securely (e.g., httpOnly cookie or secure storage)
3. **CORS**: Ensure the dashboard domain is whitelisted in backend CORS configuration
4. **Rate Limiting**: Currently not implemented
5. **API Versioning**: All endpoints are versioned (`/api/v1/`)
6. **Response Structure**: All responses follow the `ApiResponse` wrapper with `code`, `error`, `message`, `data`, and `metadata` fields
7. **Translation Handling**:
   - GET responses always include ALL supported languages
   - POST/PUT requests only need to include translations being created/updated
   - Missing translations in responses are represented as empty strings (`""`)
   - There is no default language concept; all languages are equal
8. **Supported Languages**: Fetch the list of supported languages using `GET /api/v1/supported-languages?isActive=true` to know which language codes are available for translation forms
