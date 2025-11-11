# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │            React Application (Vite)                    │  │
│  │                                                         │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │  Pages Layer                                      │ │  │
│  │  │  • Login                                          │ │  │
│  │  │  • Dashboard                                      │ │  │
│  │  │  • CitiesList, CityForm                          │ │  │
│  │  │  • LanguagesList                                 │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  │                        ↓                                │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │  Layout Layer                                     │ │  │
│  │  │  • AdminLayout (Sidebar + Outlet)                │ │  │
│  │  │  • RequireAuth (Route Guard)                     │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  │                        ↓                                │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │  API Services Layer                               │ │  │
│  │  │  • auth.ts     (login, refresh, me)              │ │  │
│  │  │  • cities.ts   (CRUD operations)                 │ │  │
│  │  │  • languages.ts (CRUD operations)                │ │  │
│  │  │  • images.ts   (upload, delete)                  │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  │                        ↓                                │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │  HTTP Client (axios)                              │ │  │
│  │  │  • Request Interceptor (inject JWT)              │ │  │
│  │  │  • Response Interceptor (refresh token)          │ │  │
│  │  │  • Base URL from env                             │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  │                        ↓                                │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │  Auth Helpers                                     │ │  │
│  │  │  • Token storage (localStorage)                  │ │  │
│  │  │  • getAccessToken, setTokens, clearTokens        │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↓ HTTP
                   ┌───────────────┐
                   │  Backend API  │
                   │ (Port 8080)   │
                   └───────────────┘
```

## Data Flow

### 1. Authentication Flow
```
User Input (Login Page)
    ↓
auth.login({ email, password })
    ↓
HTTP Client → POST /api/v1/auth/login
    ↓
Response: { accessToken, refreshToken }
    ↓
setTokens(accessToken, refreshToken)
    ↓
Navigate to Dashboard
```

### 2. Protected Route Access
```
User navigates to /cities
    ↓
RequireAuth checks getAccessToken()
    ↓ (if no token)
Navigate to /login
    ↓ (if token exists)
Render AdminLayout + CitiesList
```

### 3. API Request with Auto-Refresh
```
User action → API call
    ↓
axios.get('/api/v1/cities/admin')
    ↓
Request Interceptor: Add Authorization header
    ↓
Backend returns 401 (token expired)
    ↓
Response Interceptor catches 401
    ↓
Call /api/v1/auth/refresh with refreshToken
    ↓
Get new accessToken
    ↓
Retry original request with new token
    ↓
Return data to component
```

### 4. City CRUD Flow
```
Cities List Page
    ↓
Load: getAdminCities() → Display in table
    ↓
User clicks "New City"
    ↓
City Form loads supported languages
    ↓
User fills translations + active status
    ↓
Submit → createCity(payload)
    ↓
Success → Navigate back to list
    ↓
List refreshes with new city
```

## Folder Structure

```
src/
├── api/                    # API service layer
│   ├── auth.ts            # Authentication endpoints
│   ├── cities.ts          # Cities CRUD
│   ├── languages.ts       # Languages CRUD
│   └── images.ts          # Image upload/delete
│
├── lib/                    # Utilities and core libs
│   ├── http.ts            # Axios instance + interceptors
│   └── auth.ts            # Token management helpers
│
├── pages/                  # Page components (routes)
│   ├── Login.tsx          # Login page
│   ├── Dashboard.tsx      # Dashboard with stats
│   ├── CitiesList.tsx     # Cities data table
│   ├── CityForm.tsx       # Create/Edit city form
│   └── LanguagesList.tsx  # Languages management
│
├── layout/                 # Layout components
│   └── AdminLayout.tsx    # Main admin layout with sidebar
│
├── components/             # Reusable UI components
│   └── Button.tsx         # Styled button component
│
├── test/                   # Test files
│   ├── setup.ts           # Test configuration
│   └── auth.test.ts       # Sample test
│
├── App.tsx                 # Main app with routing
├── main.tsx                # React entry point
└── index.css               # Global styles (Tailwind)
```

## Component Hierarchy

```
App
├── BrowserRouter
│   ├── Route: /login → Login
│   └── Route: / → RequireAuth
│       └── AdminLayout
│           ├── Sidebar (Navigation)
│           └── Outlet
│               ├── Route: /dashboard → Dashboard
│               ├── Route: /cities → CitiesList
│               ├── Route: /cities/new → CityForm
│               ├── Route: /cities/:id → CityForm
│               └── Route: /languages → LanguagesList
```

## State Management

Currently using local component state with React hooks:

- **useState** - Local component state
- **useEffect** - Side effects (API calls on mount)
- **localStorage** - Persistent token storage
- **axios interceptors** - Global request/response handling

Future enhancements could add:
- React Context for global state (user profile, theme)
- React Query / SWR for server state management
- Redux Toolkit for complex state logic

## Type System

```typescript
// API Response wrapper
type ApiResponse<T> = {
  code: string
  error: boolean
  message: string
  data: T | null
  metadata: null
}

// Domain models
type City = {
  id: string
  nameTranslations: NameTranslations
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
}

type NameTranslations = {
  en: string
  ar?: string
  fr?: string
  es?: string
}

type SupportedLanguage = {
  id: string
  code: string
  name: string
  isActive: boolean
  // ... audit fields
}
```

## Security Layers

1. **Route Protection** - RequireAuth wrapper checks for valid token
2. **Token Storage** - Secure localStorage management
3. **HTTP Interceptors** - Automatic token injection
4. **Auto Refresh** - Seamless token renewal
5. **Logout** - Complete token cleanup
6. **CORS** - Backend must allow frontend origin

## Performance Optimizations

- **Code Splitting** - React.lazy() can be added for routes
- **Memoization** - useMemo/useCallback for expensive operations
- **Debouncing** - Search inputs (future)
- **Caching** - React Query for API response caching (future)
- **Pagination** - Load data in chunks (future)
- **Lazy Loading** - Images and components

## Testing Strategy

```
Unit Tests (Vitest)
├── API services (mock axios)
├── Utility functions
└── Component logic

Integration Tests (Vitest + React Testing Library)
├── User interactions
├── Form submissions
└── Navigation flows

E2E Tests (Playwright/Cypress - future)
├── Complete user journeys
├── Authentication flows
└── CRUD operations
```

## Deployment Architecture

```
Development:
npm run dev → Vite dev server (port 5173)

Production:
npm run build → dist/ folder
    ↓
Deploy to:
- Vercel / Netlify (static hosting)
- S3 + CloudFront (AWS)
- Nginx (self-hosted)
- Docker container

Environment Variables:
- .env.local (development)
- .env.production (production)
- VITE_API_BASE_URL must be set
```

## Scalability Considerations

**Current:** Simple SPA suitable for small-medium teams

**Future Enhancements:**
1. Add state management (Redux Toolkit / Zustand)
2. Implement React Query for server state
3. Add WebSocket for real-time updates
4. Implement virtual scrolling for large lists
5. Add service worker for offline support
6. Implement micro-frontend architecture if needed
7. Add feature flags for gradual rollouts

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**Minimum:** ES2020 support required
