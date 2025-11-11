# Setup Instructions

## Current Status ✅

Your admin dashboard is **ready to run**! All core features have been implemented:

### ✅ Completed Features

1. **Project Scaffold** - Vite + React + TypeScript + Tailwind CSS
2. **Authentication** - Login page with JWT token management
3. **API Integration** - All services from API_INTEGRATION.md:
   - Auth API (login, refresh, me, logout)
   - Cities API (list, create, update, delete with multi-language)
   - Languages API (list, create, update, delete)
   - Images API (upload, delete)
4. **Pages & Routing**:
   - Login page
   - Dashboard (home)
   - Cities list with CRUD
   - City create/edit form with multi-language support
   - Languages management
5. **Layout** - Admin sidebar with navigation
6. **Testing Setup** - Vitest configured with sample test
7. **Code Quality** - ESLint + Prettier configured

## Next Steps to Run

### Step 1: Install All Dependencies

Since we added testing and linting dependencies, run:

```bash
npm install
```

This will install:
- React Testing Library
- ESLint plugins
- Prettier
- jsdom for testing
- All other dependencies

### Step 2: Configure Your Backend URL

The `.env.local` file is already created with:

```env
VITE_API_BASE_URL=http://localhost:8080
```

**Update this URL** to match your actual backend API endpoint.

### Step 3: Start the Development Server

```bash
npm run dev
```

The app will start at `http://localhost:5173`

### Step 4: Login

Navigate to `http://localhost:5173/login` and use your backend credentials.

After login, you'll be redirected to the dashboard with access to:
- Dashboard
- Cities management (list, create, edit, delete)
- Languages management

## Testing the App

Run tests:

```bash
npm test
```

Run tests with UI:

```bash
npm run test:ui
```

## Code Quality

Lint your code:

```bash
npm run lint
```

Format your code:

```bash
npm run format
```

## Project Structure

```
dahsboard_admin_ajiapp/
├── src/
│   ├── api/              # API services (auth, cities, languages, images)
│   │   ├── auth.ts
│   │   ├── cities.ts
│   │   ├── languages.ts
│   │   └── images.ts
│   ├── lib/              # Utilities and HTTP client
│   │   ├── auth.ts       # Token management
│   │   └── http.ts       # Axios instance with interceptors
│   ├── pages/            # Page components
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── CitiesList.tsx
│   │   ├── CityForm.tsx
│   │   └── LanguagesList.tsx
│   ├── layout/
│   │   └── AdminLayout.tsx  # Main layout with sidebar
│   ├── test/
│   │   ├── setup.ts
│   │   └── auth.test.ts
│   ├── App.tsx           # Routes configuration
│   ├── main.tsx          # React entry point
│   └── index.css         # Tailwind imports
├── .env.local            # Your environment config
├── .env.example          # Environment template
├── package.json          # Dependencies and scripts
├── vite.config.ts        # Vite configuration
├── vitest.config.ts      # Test configuration
├── tsconfig.json         # TypeScript config
├── tailwind.config.cjs   # Tailwind config
├── .eslintrc.json        # ESLint rules
├── .prettierrc.json      # Prettier rules
├── .gitignore
└── README.md             # Full documentation

```

## API Integration Details

All endpoints from `API_INTEGRATION.md` are implemented:

### Authentication (`src/api/auth.ts`)
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token (automatic in interceptor)
- `GET /api/v1/auth/me` - Get current user
- Logout (clears local tokens)

### Cities (`src/api/cities.ts`)
- `GET /api/v1/cities/admin` - List all cities (with filter)
- `POST /api/v1/cities` - Create city
- `PUT /api/v1/cities/:id` - Update city
- `DELETE /api/v1/cities/:id` - Delete city

### Languages (`src/api/languages.ts`)
- `GET /api/v1/supported-languages` - Public list
- `GET /api/v1/supported-languages/admin` - Admin list with audit
- `POST /api/v1/supported-languages` - Create language
- `PUT /api/v1/supported-languages/:id` - Update language
- `DELETE /api/v1/supported-languages/:id` - Delete language

### Images (`src/api/images.ts`)
- `POST /api/v1/images/upload` - Upload image
- `DELETE /api/v1/images` - Delete image

## Key Features

### 🔐 Automatic Token Refresh
The HTTP client automatically refreshes expired access tokens:
1. Intercepts 401 responses
2. Calls refresh endpoint with refresh token
3. Retries original request
4. Handles concurrent requests during refresh

### 🌍 Multi-Language Support
City form dynamically loads supported languages and creates input fields for each:
- English (required)
- Arabic, French, Spanish (optional)
- Only sends non-empty translations

### 🎨 Clean Architecture
- **API Layer** - Typed services with request/response models
- **Lib Layer** - Shared utilities (auth, http client)
- **UI Layer** - Pages and layouts
- **Type Safety** - Full TypeScript coverage

## What's Next?

You can now:
1. ✅ Run the dev server and test all features
2. 🔧 Customize the UI styling
3. 📊 Add more pages from API_INTEGRATION.md (activities, hotels, visas, etc.)
4. 🧪 Add more tests
5. 🚀 Deploy to production

## Troubleshooting

### TypeScript Errors After Install
If you see TypeScript errors, restart VS Code or the TypeScript server.

### API Connection Issues
1. Verify `.env.local` has correct backend URL
2. Check backend is running
3. Check browser console for CORS errors

### Build Issues
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## Production Build

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

The build output will be in `dist/` folder.

---

**You're all set! 🎉 Run `npm install && npm run dev` to start developing!**
