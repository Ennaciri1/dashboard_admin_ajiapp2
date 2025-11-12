# API Integration Guide - Admin Dashboard

## Overview

This guide provides the API schema and integration details for connecting a React admin dashboard to the backend services.

---

## 🌍 Multi-Language Translation Support

### General Rules for All Entities

**During Creation (POST endpoints):**

- ✅ **At least one supported language** is required
- ✅ **Multiple languages** can be provided during creation
- ✅ All provided language codes must be valid and supported
- ✅ Translation values cannot be empty

**Example - Single Language:**

```json
{
  "nameTranslations": {
    "en": "Casablanca"
  }
}
```

**Example - Multiple Languages:**

```json
{
  "nameTranslations": {
    "en": "Casablanca",
    "ar": "الدار البيضاء",
    "fr": "Casablanca",
    "es": "Casablanca"
  }
}
```

**During Update (PUT endpoints):**

- Can add new languages
- Can update existing translations
- Can provide partial updates (only languages you want to change)

**Supported Languages:**

- `en` - English
- `ar` - Arabic
- `fr` - French
- `es` - Spanish
- (Check `/api/v1/supported-languages` for full list)

**Translation Response:**

- GET endpoints return all supported languages
- Missing translations appear as empty strings `""`

---

## ⚡ Entity Activation System

### Activation Requirements

Many entities in the system support an `active` field that controls whether they appear in public endpoints. To ensure data quality, **entities can only be activated when they have complete translations for all active languages**.

### Entities with Activation Validation

The following entities require complete translations before activation:

| Entity            | Required Translation Fields      |
| ----------------- | -------------------------------- |
| **Cities**        | `name`                           |
| **Contacts**      | `name`                           |
| **Hotels**        | `name`, `description`            |
| **Tourist Spots** | `name`, `description`, `address` |

### Activation Rules

1. **Default State**: All entities are created with `active: false` by default
2. **Activation Requirement**: To set `active: true`, the entity must have translations for **ALL active languages** in all required fields
3. **Validation Error**: Attempting to activate with incomplete translations returns:
   ```json
   {
     "code": "400",
     "error": true,
     "message": "Entity cannot be activated. Missing translations: field[language], field[language]",
     "data": null,
     "metadata": null
   }
   ```
4. **Deactivation**: Setting `active: false` can be done at any time without translation requirements

### Typical Workflow

1. **Create** entity with initial translations (e.g., only English)
   - Entity is created with `active: false`
2. **Add translations** for remaining active languages via UPDATE endpoint
3. **Activate** entity by setting `active: true` once all translations are complete
4. **Query** active entities using `?active=true` parameter in GET endpoints

### Example: Activating a City

```bash
# Step 1: Create city with English only
POST /api/v1/cities
{
  "nameTranslations": { "en": "Casablanca" }
}
# Response: active = false

# Step 2: Add Arabic and French translations
PUT /api/v1/cities/{id}
{
  "nameTranslations": {
    "ar": "الدار البيضاء",
    "fr": "Casablanca"
  }
}

# Step 3: Activate the city
PUT /api/v1/cities/{id}
{
  "active": true
}
# Success if all active languages have translations
# Error if any active language is missing
```

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
| `active` | Boolean | No | Filter by active status. `true` = active only, `false` = inactive only, `null/omitted` = all |

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
      "active": boolean,
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
      "active": true,
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
      "active": true,
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
    "en": "string",
    "ar": "string",
    "fr": "string",
    "es": "string"
  }
}
```

**Request Example**:

```json
{
  "nameTranslations": {
    "en": "Tangier",
    "ar": "طنجة",
    "fr": "Tanger"
  }
}
```

**Notes**:

- **At least one supported language** is required
- You can provide **multiple languages** during creation (en, ar, fr, es, etc.)
- All provided language codes must be supported
- Empty or missing translations will be returned as empty strings in GET responses
- Additional languages can be added via UPDATE endpoint
- **Cities are created with `active: false` by default**
- To activate a city, you must first add translations for ALL active languages, then update with `active: true`

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
    "active": boolean,
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
    "active": true,
    "createdAt": "2025-11-08T15:30:00",
    "updatedAt": "2025-11-08T15:30:00",
    "createdBy": "admin@example.com",
    "updatedBy": "admin@example.com"
  },
  "metadata": null
}
```

**Validation Rules**:

- At least one supported language translation is required
- All provided language codes must be valid and supported
- `nameTranslations` cannot be null or empty
- Each translation value cannot be empty

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
  "active": boolean
}
```

**Request Example**:

```json
{
  "nameTranslations": {
    "ar": "الدار البيضاء المحدثة",
    "es": "Casablanca"
  },
  "active": true
}
```

**Notes**:

- Only provide translations you want to update
- You can update individual language translations without sending all languages
- To remove a translation, omit it from the request (it will remain unchanged)
- Empty or missing translations will be returned as empty strings in GET responses

**⚠️ Activation Validation**:

- A city can only be activated (`active: true`) if it has **name translations for ALL active languages**
- If you attempt to activate a city with incomplete translations, you'll receive a `400 Bad Request` error
- The error will list which language translations are missing
- Cities created with `active: false` (default) can be activated later once all required translations are added
- Deactivation (`active: false`) can be done at any time without translation requirements

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
    "active": true,
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

**Common 400 Error Cases**:

1. **Incomplete Translations for Activation**:

```json
{
  "code": "400",
  "error": true,
  "message": "City cannot be activated. Missing translations: name[ar], name[fr]",
  "data": null,
  "metadata": null
}
```

2. **Invalid Language Code**:

```json
{
  "code": "400",
  "error": true,
  "message": "Unsupported language code provided",
  "data": null,
  "metadata": null
}
```

3. **Missing Required Fields**:

```json
{
  "code": "400",
  "error": true,
  "message": "At least one translation is required",
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
| `active` | Boolean | No | Filter by active status. `true` = active only, `false` = inactive only, `null/omitted` = all |

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
      "active": boolean
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
      "active": true
    },
    {
      "id": "lang-002",
      "code": "ar",
      "name": "Arabic",
      "active": true
    },
    {
      "id": "lang-003",
      "code": "fr",
      "name": "French",
      "active": true
    },
    {
      "id": "lang-004",
      "code": "es",
      "name": "Spanish",
      "active": false
    }
  ],
  "metadata": null
}
```

**Usage Notes**:

- Use this endpoint to fetch available language codes when building translation forms
- Typically, filter by `active=true` to show only active languages to users
- No authentication required - safe for public use

---

#### 2. Get All Supported Languages (Admin)

**Endpoint**: `GET /api/v1/supported-languages/admin`  
**Auth**: Required (ADMIN)  
**Description**: Retrieve all supported languages with full details including audit fields

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `active` | Boolean | No | Filter by active status. `true` = active only, `false` = inactive only, `null/omitted` = all |

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
      "active": boolean,
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
      "active": true,
      "createdAt": "2025-01-01T00:00:00",
      "updatedAt": "2025-01-01T00:00:00",
      "createdBy": "admin@example.com",
      "updatedBy": "admin@example.com"
    },
    {
      "id": "lang-002",
      "code": "ar",
      "name": "Arabic",
      "active": true,
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
  "active": boolean
}
```

**Request Example**:

```json
{
  "code": "de",
  "name": "German",
  "active": true
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
    "active": boolean,
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
    "active": true,
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
  "active": boolean
}
```

**Request Example**:

```json
{
  "code": "en",
  "name": "English (US)",
  "active": true
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
    "active": true,
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
- Consider setting `active=false` instead of deleting to preserve existing translations

---

### Integration Checklist for React Dashboard

- [ ] Fetch supported languages on app initialization using public endpoint
- [ ] Cache supported languages list in global state (Redux/Context)
- [ ] Create language management list component (admin only)
- [ ] Implement create language form with code and name validation
- [ ] Implement edit language form
- [ ] Add delete language confirmation with warning about translation impact
- [ ] Use language codes dynamically when building translation forms for other entities
- [ ] Filter by `active=true` for user-facing forms
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
| `active` | Boolean | No | Filter by active status. `true` = active only, `false` = inactive only, `null/omitted` = all |

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
      "active": true
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
| `active` | Boolean | Whether the contact is active |

---

#### 2. Get All Contacts (Admin)

**Endpoint**: `GET /api/v1/contacts/admin`  
**Auth**: Required (ADMIN)  
**Description**: Retrieve all contacts with translations in all supported languages (includes audit fields)

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `active` | Boolean | No | Filter by active status. `true` = active only, `false` = inactive only, `null/omitted` = all |

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
      "active": true,
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
| `active` | Boolean | Whether the contact is active |
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
  "active": true
}
```

**Request Schema**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `nameTranslations` | Object | Yes | Contact name in multiple languages. At least one language required. |
| `link` | String | Yes | Contact link (URL, email, phone) |
| `icon` | String | Yes | Icon URL for the contact |
| `active` | Boolean | No | Whether the contact is active (default: false) |

**Notes**:

- Contacts are created with `active: false` by default
- To activate a contact, you must first add name translations for ALL active languages
- Use the Update endpoint to add remaining translations and activate

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
    "active": true,
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
  "active": false
}
```

**Request Schema**: Same as Create Contact

**⚠️ Activation Validation**:

- A contact can only be activated (`active: true`) if it has **name translations for ALL active languages**
- If you attempt to activate a contact with incomplete translations, you'll receive a `400 Bad Request` error
- The error will list which language translations are missing
- Contacts created with `active: false` (default) can be activated later once all required translations are added
- Deactivation (`active: false`) can be done at any time without translation requirements

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
    "active": false,
    "createdAt": "2025-11-08T15:30:00",
    "updatedAt": "2025-11-09T16:00:00",
    "createdBy": "admin@example.com",
    "updatedBy": "admin@example.com"
  },
  "metadata": null
}
```

**Error Responses**:

- `400 Bad Request`: Invalid request body or incomplete translations when trying to activate

**Common 400 Error Cases**:

1. **Incomplete Translations for Activation**:

```json
{
  "code": "400",
  "error": true,
  "message": "Contact cannot be activated. Missing translations: name[ar], name[es]",
  "data": null,
  "metadata": null
}
```

2. **Missing Required Fields**:

```json
{
  "code": "400",
  "error": true,
  "message": "Invalid request body",
  "data": null,
  "metadata": null
}
```

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

   - `?active=true` - Returns only active contacts
   - `?active=false` - Returns only inactive contacts
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
| `active` | Boolean | No | Filter by active status. `true` = active only, `false` = inactive only, `null/omitted` = all |

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
          "owner": "Hotel exterior"
        }
      ],
      "minPrice": 150.0,
      "likesCount": 245,
      "active": true,
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
| `images` | Array | List of hotel images with URL and owner text |
| `minPrice` | Double | Minimum room price |
| `likesCount` | Integer | Number of likes |
| `active` | Boolean | Whether the hotel is active |
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
| `active` | Boolean | No | Filter by active status. `true` = active only, `false` = inactive only, `null/omitted` = all |

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
          "owner": "Hotel exterior"
        }
      ],
      "minPrice": 150.0,
      "likesCount": 245,
      "active": true,
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
**Description**: Create a new hotel with translations (at least one supported language required)

**Request Body**:

```json
{
  "nameTranslations": {
    "en": "Grand Hotel",
    "ar": "فندق جراند",
    "fr": "Grand Hôtel"
  },
  "descriptionTranslations": {
    "en": "Luxury hotel in the heart of the city",
    "ar": "فندق فاخر في قلب المدينة",
    "fr": "Hôtel de luxe au cœur de la ville"
  },
  "cityId": "city123",
  "location": {
    "latitude": 33.5731,
    "longitude": -7.5898
  },
  "images": [
    {
      "url": "https://example.com/hotel1.jpg",
      "ownerId": "user123",
      "ownerType": "ADMIN"
    }
  ],
  "minPrice": 150.0
}
```

**Request Schema**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `nameTranslations` | Object | Yes | Hotel name (at least one supported language) |
| `descriptionTranslations` | Object | Yes | Hotel description (at least one supported language) |
| `cityId` | String | Yes | ID of the city |
| `location` | Object | Yes | GPS coordinates with latitude and longitude |
| `images` | Array | Yes | List of images (at least one required) |
| `minPrice` | Double | Yes | Minimum room price |

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
        "owner": "Hotel exterior"
      }
    ],
    "minPrice": 150.0,
    "likesCount": 0,
    "active": false,
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

- Hotels are created as **inactive by default** (`active: false`)
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
      "owner": "New hotel image"
    }
  ],
  "minPrice": 200.0,
  "active": true
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
| `active` | Boolean | Activate/deactivate hotel (requires all language translations to be complete) |

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
        "owner": "New hotel image"
      }
    ],
    "minPrice": 200.0,
    "likesCount": 245,
    "active": true,
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

   - Hotels are created as **inactive** (`active: false`) by default
   - To activate a hotel, ALL supported languages must have translations for both name and description
   - If translations are incomplete, activation will fail with error code `INCOMPLETE_TRANSLATIONS`

4. **Location Validation**: Both latitude and longitude are required and must be valid coordinates

5. **Images**:

   - Array of objects with `url` and `owner` fields
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

   - `?active=true` - Returns only active hotels
   - `?active=false` - Returns only inactive hotels
   - No parameter or `null` - Returns all hotels

9. **Public vs Admin Endpoints**:
   - Public endpoint (`GET /`) - No authentication, includes user interaction fields (isLikedByUser, isBookmarkedByUser)
   - Admin endpoint (`GET /admin`) - Requires authentication, includes all audit fields but no user interaction fields

### Additional Hotel Endpoints

#### Like/Unlike Hotel

**Endpoint**: `POST /api/v1/hotels/{hotelId}/like?isLike={boolean}`  
**Auth**: Required (USER role)  
**Description**: Like or unlike a hotel

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `hotelId` | String | Yes | Hotel ID |

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `isLike` | Boolean | Yes | `true` to like, `false` to unlike |

**Example Request**:

```
POST /api/v1/hotels/hotel-123/like?isLike=true
```

**Success Response**: `200 OK`

```json
{
  "code": "200",
  "error": false,
  "message": "Hotel liked successfully",
  "data": null
}
```

**Error Responses**:

- `401 UNAUTHORIZED` - Not authenticated
- `403 FORBIDDEN` - Not USER role
- `404 NOT FOUND` - Hotel not found

**Notes**:

- Requires USER role authentication
- Unlike message: "Hotel unliked successfully"
- Likes count is included in hotel response DTOs
- Like status persists per user

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

3. **Language Codes**: Must be valid supported language codes. Fetch available languages from `GET /api/v1/supported-languages?active=true`

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

## 👤 Activity User Profile Management

### Base URL

```
/api/v1/activity/profile
```

### Authentication

- Requires `Authorization: Bearer {JWT_TOKEN}` with `ACTIVITY` role

---

### Endpoints

#### Complete or Update Activity Profile

**Endpoint**: `PUT /api/v1/activity/profile`  
**Auth**: Required (ACTIVITY role)  
**Description**: Complete or update the profile for an activity user (organization banner, title, description)

**Request Body**:

```json
{
  "title": "Adventure Tours Morocco",
  "description": "Professional adventure tour operator specializing in desert safaris and mountain trekking",
  "imageUrl": "https://storage.example.com/profiles/adventure-tours-banner.jpg"
}
```

**Field Validation**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | String | Yes | Organization/business name shown on profile |
| `description` | String | Yes | Short bio or summary for the profile |
| `imageUrl` | String | Yes | Cover/banner image URL for the profile |

**Success Response**: `200 OK`

```json
{
  "code": "200",
  "error": false,
  "message": "Activity user profile updated successfully",
  "data": {
    "profileType": "ACTIVITY",
    "title": "Adventure Tours Morocco",
    "description": "Professional adventure tour operator specializing in desert safaris and mountain trekking",
    "imageUrl": "https://storage.example.com/profiles/adventure-tours-banner.jpg"
  }
}
```

**Error Responses**:

- `400 BAD REQUEST` - Invalid request body or missing required fields
- `401 UNAUTHORIZED` - Not authenticated
- `403 FORBIDDEN` - Not ACTIVITY role

---

### Usage Notes

1. **Profile Purpose**:

   - Activity profile is the public-facing banner for activity users
   - Displayed when users view activities grouped by provider
   - Shows organization name, description, and banner image

2. **Image Upload**:

   - Upload banner image first using `POST /api/v1/images/upload?subdirectory=activity-profiles`
   - Get the returned `imageUrl`
   - Use that URL in this profile update request

3. **Profile Updates**:

   - Can be updated multiple times
   - All fields are required on each update
   - Changes reflect immediately in public activity listings

4. **Default Profile**:

   - New ACTIVITY users start without a profile
   - System falls back to user's `fullName` and `profilePicture` if profile incomplete
   - Completing profile improves professional appearance

5. **Public Visibility**:
   - Profile data appears in:
     - `GET /api/v1/activities` (public listings)
     - `GET /api/v1/activities/admin` (admin view)
   - Profile shown above all activities from this user

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
      "cityId": "string",
      "imageData": [
        {
          "url": "string",
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
      "cityId": "city-123",
      "imageData": [
        {
          "url": "https://storage.example.com/spots/hassan-mosque.jpg",
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
| `active` | Boolean | No | Filter by active status |

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
          "owner": "string"
        }
      ],
      "cityId": "string",
      "addressTranslations": {
        "en": "string",
        "ar": "string",
        "fr": "string"
      },
      "isPaidEntry": boolean,
      "likes": number,
      "openingTime": "HH:mm:ss",
      "closingTime": "HH:mm:ss",
      "active": boolean,
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
          "owner": "admin@example.com"
        }
      ],
      "cityId": "city-123",
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
      "active": true,
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
**Description**: Create a new tourist spot with translations in any supported languages (minimum one language required).

**Request Body**:

```json
{
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
    "en": "string (optional)",
    "ar": "string (optional)"
  },
  "location": {
    "latitude": number,
    "longitude": number
  },
  "images": [
    {
      "url": "string",
      "ownerId": "string",
      "ownerType": "string"
    }
  ],
  "cityId": "string (required)",
  "isPaidEntry": boolean,
  "openingTime": "HH:mm (optional)",
  "closingTime": "HH:mm (optional)",
  "suggestedBy": "string (optional, defaults to 'AJIAPP')"
}
```

**Example Request**:

```json
{
  "nameTranslations": {
    "en": "Jardin Majorelle",
    "ar": "حديقة ماجوريل",
    "fr": "Jardin Majorelle"
  },
  "descriptionTranslations": {
    "en": "Botanical garden and artist's landscape garden",
    "ar": "حديقة نباتية وحديقة المناظر الطبيعية",
    "fr": "Jardin botanique et jardin paysager"
  },
  "addressTranslations": {
    "en": "Rue Yves Saint Laurent, Marrakech",
    "ar": "شارع إيف سان لوران، مراكش",
    "fr": "Rue Yves Saint Laurent, Marrakech"
  },
  "location": {
    "latitude": 31.6416,
    "longitude": -8.0032
  },
  "images": [
    {
      "url": "https://storage.example.com/spots/majorelle.jpg",
      "ownerId": "admin-123",
      "ownerType": "ADMIN"
    }
  ],
  "cityId": "city-456",
  "isPaidEntry": true,
  "openingTime": "08:00",
  "closingTime": "18:00",
  "suggestedBy": "AJIAPP"
}
```

**Response**: Returns `TouristSpotResponseDto` (same as admin GET response)

**Validation Rules**:

- At least one supported language translation is required for name and description
- All provided language codes must be valid and supported
- `cityId` must reference an existing city
- Location coordinates must be valid (latitude: -90 to 90, longitude: -180 to 180)
- Tourist spot is created with `active: false` (must be activated by admin)
- Additional languages can be added/updated via PUT endpoint

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
      "owner": "string"
    }
  ],
  "cityId": "string",
  "isPaidEntry": boolean,
  "openingTime": "HH:mm:ss",
  "closingTime": "HH:mm:ss",
  "active": boolean,
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
- If attempting to set `active: true`, all required translations must be complete (name, description, address for all active languages)
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

   - Tourist spots are created inactive (`active: false`)
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

   - Array of image objects with URL, owner text, and owner
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

## ⭐ Reviews Management

### Base URL

```
/api/v1/reviews
```

### Authentication

- **Public Endpoints**: `GET /api/v1/reviews` (Get reviews for entity)
- **User Endpoints**: `POST`, `PUT`, `DELETE` require authentication
- **Admin Endpoints**: `GET /api/v1/reviews/all`, `PUT /{reviewId}/status` require `ADMIN` role

---

### Endpoints

#### 1. Create Review

**Endpoint**: `POST /api/v1/reviews`  
**Auth**: Required (Any authenticated user)  
**Description**: Create a new review for an entity (tourist spot, hotel, activity, etc.)

**Request Body**:

```json
{
  "message": "Amazing place! The architecture is breathtaking and the sunset view is unforgettable.",
  "rating": 5,
  "entityType": "spot",
  "entityId": "spot-123"
}
```

**Request Fields**:
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `message` | String | Yes | Max 600 characters | Review message/comment |
| `rating` | Integer | Yes | 1-5 | Star rating |
| `entityType` | String | Yes | Not blank | Entity type: "spot", "hotel", "activity", etc. |
| `entityId` | String | Yes | Not blank | ID of the entity being reviewed |

**Success Response**: `201 CREATED`

```json
{
  "code": "201",
  "error": false,
  "message": "Review created successfully",
  "data": {
    "id": "review-123",
    "message": "Amazing place! The architecture is breathtaking and the sunset view is unforgettable.",
    "rating": 5,
    "date": "2025-11-12T14:30:00",
    "status": "PENDING",
    "entityType": "spot",
    "entityId": "spot-123",
    "rejectionReason": null,
    "approvedAt": null,
    "userName": "John Doe",
    "userProfilePicture": "https://storage.example.com/users/john.jpg"
  }
}
```

**Error Responses**:

- `409 CONFLICT` - User already reviewed this entity
- `401 UNAUTHORIZED` - Not authenticated
- `404 NOT FOUND` - User not found

**Notes**:

- Review status defaults to `PENDING`
- One user can only review each entity once
- User information (name, profile picture) is included in response

---

#### 2. Get Reviews for Entity

**Endpoint**: `GET /api/v1/reviews?entityType={type}&entityId={id}&status={status}`  
**Auth**: None (Public)  
**Description**: Get all reviews for a specific entity with statistics

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `entityType` | String | Yes | Entity type: "spot", "hotel", "activity", etc. |
| `entityId` | String | Yes | Entity ID |
| `status` | String | No | Filter by status: "PENDING", "APPROVED", "REJECTED". Omit for all statuses |

**Example Request**:

```
GET /api/v1/reviews?entityType=spot&entityId=spot-123&status=APPROVED
```

**Success Response**: `200 OK`

```json
{
  "code": "200",
  "error": false,
  "message": "Reviews retrieved successfully",
  "data": {
    "reviews": [
      {
        "id": "review-123",
        "message": "Amazing place! The architecture is breathtaking.",
        "rating": 5,
        "date": "2025-11-12T14:30:00",
        "status": "APPROVED",
        "entityType": "spot",
        "entityId": "spot-123",
        "rejectionReason": null,
        "approvedAt": "2025-11-12T15:00:00",
        "userName": "John Doe",
        "userProfilePicture": "https://storage.example.com/users/john.jpg"
      },
      {
        "id": "review-124",
        "message": "Beautiful spot but very crowded.",
        "rating": 4,
        "date": "2025-11-11T10:20:00",
        "status": "APPROVED",
        "entityType": "spot",
        "entityId": "spot-123",
        "rejectionReason": null,
        "approvedAt": "2025-11-11T11:00:00",
        "userName": "Jane Smith",
        "userProfilePicture": null
      }
    ],
    "stats": {
      "averageRating": 4.5,
      "totalCount": 5,
      "approvedCount": 2,
      "pendingCount": 2,
      "rejectedCount": 1
    }
  }
}
```

**Response Fields**:

**Review Object**:
| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Review ID |
| `message` | String | Review message |
| `rating` | Integer | Star rating (1-5) |
| `date` | LocalDateTime | Review creation date |
| `status` | String | "PENDING", "APPROVED", "REJECTED", "DELETED" |
| `entityType` | String | Type of reviewed entity |
| `entityId` | String | ID of reviewed entity |
| `rejectionReason` | String | Reason for rejection (null if not rejected) |
| `approvedAt` | LocalDateTime | Approval/rejection timestamp (null if pending) |
| `userName` | String | Reviewer's full name |
| `userProfilePicture` | String | Reviewer's profile picture URL (null if not set) |

**Stats Object**:
| Field | Type | Description |
|-------|------|-------------|
| `averageRating` | Double | Average rating from approved reviews only (0.0 if none) |
| `totalCount` | Long | Total number of reviews (all statuses) |
| `approvedCount` | Long | Number of approved reviews |
| `pendingCount` | Long | Number of pending reviews |
| `rejectedCount` | Long | Number of rejected reviews |

---

#### 3. Get All Reviews (Admin)

**Endpoint**: `GET /api/v1/reviews/all?status={status}`  
**Auth**: Required (ADMIN)  
**Description**: Get all reviews across all entities (admin view)

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | String | No | Filter by status: "PENDING", "APPROVED", "REJECTED". Omit for all |

**Example Request**:

```
GET /api/v1/reviews/all?status=PENDING
```

**Success Response**: `200 OK`

```json
{
  "code": "200",
  "error": false,
  "message": "All reviews retrieved successfully",
  "data": [
    {
      "id": "review-125",
      "message": "Great hotel with excellent service!",
      "rating": 5,
      "date": "2025-11-12T16:00:00",
      "status": "PENDING",
      "entityType": "hotel",
      "entityId": "hotel-456",
      "rejectionReason": null,
      "approvedAt": null,
      "userName": "Sarah Johnson",
      "userProfilePicture": "https://storage.example.com/users/sarah.jpg"
    },
    {
      "id": "review-126",
      "message": "Nice spot for families.",
      "rating": 4,
      "date": "2025-11-12T15:30:00",
      "status": "PENDING",
      "entityType": "spot",
      "entityId": "spot-789",
      "rejectionReason": null,
      "approvedAt": null,
      "userName": "Mike Brown",
      "userProfilePicture": null
    }
  ]
}
```

**Notes**:

- Returns reviews from all entities
- Useful for moderation dashboard
- Can filter by status to show pending reviews needing approval

---

#### 4. Update Review

**Endpoint**: `PUT /api/v1/reviews/{reviewId}`  
**Auth**: Required (Review owner only)  
**Description**: Update review message and rating

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `reviewId` | String | Review ID |

**Request Body**:

```json
{
  "message": "Updated review: Still amazing, visited again and loved it even more!",
  "rating": 5
}
```

**Request Fields**:
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `message` | String | Yes | Max 600 characters | Updated review message |
| `rating` | Integer | Yes | 1-5 | Updated star rating |

**Success Response**: `200 OK`

```json
{
  "code": "200",
  "error": false,
  "message": "Review updated successfully",
  "data": {
    "id": "review-123",
    "message": "Updated review: Still amazing, visited again and loved it even more!",
    "rating": 5,
    "date": "2025-11-12T14:30:00",
    "status": "PENDING",
    "entityType": "spot",
    "entityId": "spot-123",
    "rejectionReason": null,
    "approvedAt": null,
    "userName": "John Doe",
    "userProfilePicture": "https://storage.example.com/users/john.jpg"
  }
}
```

**Error Responses**:

- `401 UNAUTHORIZED` - Not authenticated or not review owner
- `404 NOT FOUND` - Review not found
- `401 UNAUTHORIZED` - Cannot update deleted review

**Notes**:

- Only the review owner can update their review
- Status resets to `PENDING` when review is updated
- Approval fields (`approvedBy`, `approvedAt`, `rejectionReason`) are cleared

---

#### 5. Update Review Status (Admin)

**Endpoint**: `PUT /api/v1/reviews/{reviewId}/status`  
**Auth**: Required (ADMIN)  
**Description**: Approve or reject a review

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `reviewId` | String | Review ID |

**Request Body - Approve**:

```json
{
  "status": "APPROVED"
}
```

**Request Body - Reject**:

```json
{
  "status": "REJECTED",
  "rejectionReason": "Contains inappropriate content"
}
```

**Request Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | String | Yes | "APPROVED", "REJECTED", "PENDING", "DELETED" |
| `rejectionReason` | String | Required for REJECTED | Reason for rejection |

**Success Response**: `200 OK`

```json
{
  "code": "200",
  "error": false,
  "message": "Review status updated successfully",
  "data": {
    "id": "review-123",
    "message": "Amazing place! The architecture is breathtaking.",
    "rating": 5,
    "date": "2025-11-12T14:30:00",
    "status": "APPROVED",
    "entityType": "spot",
    "entityId": "spot-123",
    "rejectionReason": null,
    "approvedAt": "2025-11-12T17:00:00",
    "userName": "John Doe",
    "userProfilePicture": "https://storage.example.com/users/john.jpg"
  }
}
```

**Error Responses**:

- `400 BAD REQUEST` - Rejection reason required when rejecting
- `403 FORBIDDEN` - Not admin
- `404 NOT FOUND` - Review not found

**Notes**:

- Sets `approvedBy` to admin user ID
- Sets `approvedAt` timestamp
- `rejectionReason` is required when status is `REJECTED`
- Clearing rejection: set status to `APPROVED` or `PENDING`

---

#### 6. Delete Review

**Endpoint**: `DELETE /api/v1/reviews/{reviewId}`  
**Auth**: Required (Review owner only)  
**Description**: Delete a review (soft delete)

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `reviewId` | String | Review ID |

**Success Response**: `200 OK`

```json
{
  "code": "200",
  "error": false,
  "message": "Review deleted successfully",
  "data": null
}
```

**Error Responses**:

- `401 UNAUTHORIZED` - Not authenticated or not review owner
- `404 NOT FOUND` - Review not found

**Notes**:

- Only the review owner can delete their review
- Deletion removes the review from database (hard delete)

---

### Review Status Workflow

```
┌──────────┐
│ PENDING  │ ← Default status when created
└────┬─────┘
     │
     ├──→ APPROVED (by admin)
     │
     ├──→ REJECTED (by admin, requires reason)
     │
     └──→ DELETED (by owner or admin)

When review is updated by owner:
APPROVED/REJECTED → PENDING (reset to pending)
```

---

### Usage Notes

1. **One Review Per Entity**:

   - Each user can only create one review per entity
   - Attempting to create duplicate returns `409 CONFLICT`

2. **Review Moderation**:

   - All reviews default to `PENDING` status
   - Admin must approve/reject reviews
   - Approved reviews appear in statistics and public ratings

3. **Statistics Calculation**:

   - `averageRating` calculated from `APPROVED` reviews only
   - All counts include respective status totals
   - Statistics update automatically when review status changes

4. **User Information**:

   - `userName` and `userProfilePicture` dynamically fetched from User entity
   - Shows "Unknown User" if user deleted
   - Profile picture can be null

5. **Entity Types**:

   - Supported: `"spot"` (tourist spot), `"hotel"`, `"activity"`, etc.
   - Entity type and ID must match existing entities
   - No foreign key validation (flexible design)

6. **Updating Reviews**:

   - When user updates their review, status resets to `PENDING`
   - Requires re-approval by admin
   - Previous approval data is cleared

7. **Rejection Reasons**:

   - Required when setting status to `REJECTED`
   - Helps users understand why review was rejected
   - Can be null for other statuses

8. **Public Access**:

   - GET endpoints are public (no authentication required)
   - Allows displaying reviews to all visitors
   - POST/PUT/DELETE require authentication

9. **Admin Management**:

   - `GET /all` shows all reviews across entities
   - Useful for moderation dashboard
   - Filter by `PENDING` to see reviews needing approval

10. **Rating System**:
    - 1-5 star rating (integer)
    - Average calculated with 2 decimal precision
    - Ratings only from approved reviews affect entity rating

---

## 📋 Planned Features

_The following features are planned but not yet implemented:_

- **Stadiums Management** - Endpoints for stadium information
- **Visas Management** - Visa requirements and information
- **Features/Discover** - Content discovery and featured items
- **User Management** - Admin endpoints to manage user accounts (list, view, update, delete users)

_Note: Security configuration whitelists GET requests to `/api/v1/visas/**`, `/api/v1/features/**`, and `/api/v1/discover/**`, but these endpoints are not yet implemented._

---

## 📝 Recently Added Features

The following features were recently documented:

- **Activity User Profile Management** (November 2025) - Complete/update activity user profiles
- **Hotel Like/Unlike** (November 2025) - Like functionality for hotels
- **Reviews Management** (November 2025) - Full review system with admin moderation

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
8. **Supported Languages**: Fetch the list of supported languages using `GET /api/v1/supported-languages?active=true` to know which language codes are available for translation forms
