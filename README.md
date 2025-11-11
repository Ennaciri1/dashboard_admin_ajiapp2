# Admin Dashboard (Vite + React + TypeScript)

A modern admin dashboard built with **Vite**, **React**, **TypeScript**, and **Tailwind CSS**, following clean architecture principles.

## Features

✅ **Authentication** - Login with JWT token management and automatic refresh  
✅ **Cities Management** - CRUD operations with multi-language support  
✅ **Languages Management** - Manage supported languages for translations  
✅ **Image Upload** - File upload API integration ready  
✅ **Clean Architecture** - Organized folders: `api/`, `lib/`, `pages/`, `layout/`, `components/`  
✅ **Type Safety** - Full TypeScript with typed API services  
✅ **Responsive UI** - Tailwind CSS with mobile-friendly design  
✅ **Testing** - Vitest setup with sample tests  

## Project Structure

```
src/
├── api/              # API service modules (auth, cities, languages, images)
├── lib/              # HTTP client, auth helpers, utilities
├── pages/            # Page components (Login, Dashboard, Cities, etc.)
├── layout/           # Layout components (AdminLayout, Sidebar)
├── components/       # Reusable UI components (future)
├── hooks/            # Custom React hooks (future)
├── utils/            # Helper functions (future)
├── test/             # Test setup and test files
├── App.tsx           # Main app with routing
├── main.tsx          # React entry point
└── index.css         # Global styles with Tailwind
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local` and set your backend API URL:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:8080
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
npm run preview
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests with Vitest
- `npm run test:ui` - Run tests with Vitest UI
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## API Integration

All API services are implemented in `src/api/` with typed request/response shapes based on `API_INTEGRATION.md`:

- **Auth** (`auth.ts`) - Login, logout, refresh token, get current user
- **Cities** (`cities.ts`) - CRUD operations with multi-language translations
- **Languages** (`languages.ts`) - Manage supported languages
- **Images** (`images.ts`) - Upload and delete images

### Authentication Flow

1. User logs in via `/login` page
2. JWT tokens (access + refresh) stored in `localStorage`
3. `axios` interceptor adds `Authorization: Bearer <token>` to all requests
4. On 401 error, automatic token refresh attempt
5. If refresh fails, user redirected to login

### Token Refresh Logic

The HTTP client (`src/lib/http.ts`) implements automatic token refresh:
- Intercepts 401 responses
- Calls `/api/v1/auth/refresh` with refresh token
- Retries original request with new access token
- Handles concurrent requests during refresh

## Pages & Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/login` | `Login` | Authentication page |
| `/dashboard` | `Dashboard` | Main dashboard (protected) |
| `/cities` | `CitiesList` | List all cities with CRUD actions |
| `/cities/new` | `CityForm` | Create new city |
| `/cities/:id` | `CityForm` | Edit existing city |
| `/languages` | `LanguagesList` | Manage supported languages |

## Multi-Language Support

Cities support translations in multiple languages (English, Arabic, French, Spanish, etc.):

1. **Fetch Languages** - Get active languages from `/api/v1/supported-languages`
2. **Translation Fields** - City form dynamically generates inputs for each language
3. **Partial Updates** - Only send changed translations when editing
4. **Validation** - English (`en`) translation is required

## Next Steps

### Immediate Enhancements
- [ ] Add loading spinners and better error messages
- [ ] Implement user profile page with `GET /api/v1/auth/me`
- [ ] Add image upload UI component for cities
- [ ] Add pagination for cities list
- [ ] Implement search/filter for cities

### Additional Features
- [ ] Activities management (based on API_INTEGRATION.md)
- [ ] Hotels management
- [ ] Tourist spots management
- [ ] Stadiums management
- [ ] Visas management
- [ ] User management (admin)
- [ ] Analytics dashboard with charts

### Code Quality
- [ ] Add more unit tests for components
- [ ] Add integration tests for API services
- [ ] Implement error boundary component
- [ ] Add loading skeleton components
- [ ] Set up CI/CD pipeline

## Architecture Notes

This project follows clean architecture principles:

- **Separation of Concerns** - API logic separated from UI components
- **Type Safety** - TypeScript interfaces for all data models
- **Reusability** - Shared utilities and components
- **Testability** - Services can be tested independently
- **Scalability** - Easy to add new features and pages

The `src/lib/http.ts` axios instance handles:
- Base URL configuration from environment
- JWT token injection
- Automatic token refresh on 401
- Request/response interceptors

## Troubleshooting

### "npm: command not found"
Install Node.js and npm first (see installation instructions in terminal output)

### Port 5173 already in use
Change port in `vite.config.ts`:
```ts
export default defineConfig({
  server: { port: 3000 }
})
```

### API connection errors
1. Check `.env.local` has correct `VITE_API_BASE_URL`
2. Ensure backend API is running
3. Check CORS settings on backend

### TypeScript errors
Run `npm install` to ensure all type definitions are installed

## License

MIT
