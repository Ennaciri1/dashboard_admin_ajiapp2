# Common Issues & Solutions

## Installation Issues

### Issue: `npm: command not found`
**Solution:**
Install Node.js and npm first:
```bash
# Option 1: NodeSource (recommended)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Option 2: apt
sudo apt update
sudo apt install nodejs npm

# Verify installation
node --version
npm --version
```

### Issue: `Package version not found` (e.g., tailwindcss)
**Solution:**
The version specified in package.json may not exist yet. Run:
```bash
npm install
```
The versions in the updated package.json are verified and compatible.

### Issue: `Permission denied` during npm install
**Solution:**
```bash
# Fix npm permissions
sudo chown -R $USER ~/.npm
sudo chown -R $USER /usr/local/lib/node_modules

# Or use nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
source ~/.bashrc
nvm install --lts
```

---

## Development Issues

### Issue: TypeScript errors showing "Cannot find module"
**Cause:** Dependencies not installed yet  
**Solution:**
```bash
npm install
```
After installation, restart VS Code or the TypeScript server:
- Press `Ctrl+Shift+P`
- Type "TypeScript: Restart TS Server"

### Issue: Tailwind classes not working / no styling
**Cause:** PostCSS or Tailwind not configured properly  
**Solution:**
1. Verify `tailwind.config.cjs` exists
2. Verify `postcss.config.cjs` exists
3. Check `index.css` has the Tailwind directives:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```
4. Restart dev server: `npm run dev`

### Issue: "Unknown at rule @tailwind" warning
**Cause:** VS Code CSS validation doesn't recognize Tailwind directives  
**Solution:** This is a harmless warning. To hide it:
1. Install "Tailwind CSS IntelliSense" extension in VS Code
2. Or add to `.vscode/settings.json`:
```json
{
  "css.lint.unknownAtRules": "ignore"
}
```

### Issue: Hot Module Replacement (HMR) not working
**Cause:** File system watcher limits (Linux)  
**Solution:**
```bash
# Increase inotify watches
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

---

## Runtime Issues

### Issue: "Failed to fetch" or network errors when calling API
**Cause 1:** Backend not running  
**Solution:** Start your backend server

**Cause 2:** Wrong API URL in `.env.local`  
**Solution:** 
```bash
# Edit .env.local
VITE_API_BASE_URL=http://localhost:8080

# Restart dev server after changing .env
npm run dev
```

**Cause 3:** CORS error  
**Solution:** Configure CORS on your backend to allow `http://localhost:5173`

### Issue: "401 Unauthorized" on every request
**Cause:** Token expired or invalid  
**Solution:**
1. Clear browser localStorage
2. Log in again
3. Check backend token validation logic

### Issue: Login works but redirects back to login immediately
**Cause:** Token not being stored properly  
**Solution:**
1. Check browser console for errors
2. Verify `setTokens()` is called in `src/api/auth.ts`
3. Check `getAccessToken()` returns the token
4. Clear browser cache and localStorage

### Issue: Token refresh not working (keeps logging out)
**Cause:** Refresh token endpoint not returning correct format  
**Solution:**
Check backend `/api/v1/auth/refresh` returns:
```json
{
  "code": "200",
  "error": false,
  "message": "Token refreshed",
  "data": {
    "accessToken": "new-token",
    "refreshToken": "new-refresh-token",
    "expiresIn": 3600
  }
}
```

### Issue: Cities form shows no language fields
**Cause:** Supported languages API not returning data  
**Solution:**
1. Check backend `/api/v1/supported-languages` endpoint
2. Verify at least one language exists in backend database
3. Check browser console for API errors

### Issue: "Cannot read property 'nameTranslations' of undefined"
**Cause:** API response format doesn't match expected structure  
**Solution:**
Verify backend response matches the API_INTEGRATION.md spec:
```json
{
  "data": [
    {
      "id": "...",
      "nameTranslations": { "en": "..." },
      "isActive": true
    }
  ]
}
```

---

## Build Issues

### Issue: Build fails with TypeScript errors
**Solution:**
```bash
# Fix type errors first
npm run lint

# Clean build
rm -rf dist
npm run build
```

### Issue: Build succeeds but production app shows blank page
**Cause:** Base URL misconfiguration  
**Solution:**
If deploying to a subdirectory, update `vite.config.ts`:
```ts
export default defineConfig({
  base: '/admin/', // If deployed to example.com/admin/
  plugins: [react()],
})
```

### Issue: Environment variables not working in production
**Cause:** Vite only includes `VITE_*` prefixed vars  
**Solution:**
- Ensure variable starts with `VITE_`: `VITE_API_BASE_URL`
- Set env var in your hosting platform (Vercel/Netlify/etc.)

---

## Testing Issues

### Issue: Tests fail with "document is not defined"
**Cause:** Test environment not configured as jsdom  
**Solution:**
Verify `vitest.config.ts` has:
```ts
export default defineConfig({
  test: {
    environment: 'jsdom',
  },
})
```

### Issue: "Cannot find module @testing-library/react"
**Solution:**
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom jsdom
```

---

## Performance Issues

### Issue: Slow page loads
**Solution:**
1. Implement code splitting:
```tsx
const CitiesList = lazy(() => import('./pages/CitiesList'))
```
2. Add pagination to lists
3. Optimize images
4. Use React.memo for expensive components

### Issue: API requests too slow
**Solution:**
1. Implement caching with React Query:
```bash
npm install @tanstack/react-query
```
2. Add loading states
3. Implement pagination
4. Use debouncing for search inputs

---

## Authentication Issues

### Issue: User keeps getting logged out
**Cause 1:** Token expiration too short  
**Solution:** Increase token expiration on backend

**Cause 2:** localStorage getting cleared  
**Solution:** Check for browser extensions or privacy settings clearing storage

**Cause 3:** Refresh token logic failing silently  
**Solution:** Add console.log in `src/lib/http.ts` interceptor to debug

### Issue: "Network Error" on login
**Cause:** Backend not reachable or CORS issue  
**Solution:**
1. Check backend is running: `curl http://localhost:8080/api/v1/auth/login`
2. Verify CORS headers on backend
3. Check `.env.local` has correct URL

---

## Deployment Issues

### Issue: App works locally but not on production
**Cause:** Environment variables not set  
**Solution:**
Set `VITE_API_BASE_URL` in your hosting platform:
- **Vercel:** Project Settings → Environment Variables
- **Netlify:** Site Settings → Environment Variables
- **Docker:** Pass via `-e` flag or docker-compose

### Issue: 404 errors on page refresh (production)
**Cause:** SPA routing not configured on server  
**Solution:**

**Netlify:** Create `public/_redirects`:
```
/*  /index.html  200
```

**Vercel:** Create `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

**Nginx:**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### Issue: Assets not loading (CSS/JS)
**Cause:** Incorrect base path  
**Solution:**
Update `vite.config.ts`:
```ts
export default defineConfig({
  base: './', // Use relative paths
})
```

---

## Browser Issues

### Issue: App doesn't work in Safari
**Cause:** ES6+ features not supported  
**Solution:**
Add to `vite.config.ts`:
```ts
export default defineConfig({
  build: {
    target: 'es2015', // Broader browser support
  },
})
```

### Issue: LocalStorage not persisting
**Cause:** Private/Incognito mode or browser settings  
**Solution:**
Inform user or implement fallback to sessionStorage

---

## API Integration Issues

### Issue: Multi-language form not saving translations
**Cause:** Empty strings being sent  
**Solution:**
The `CityForm.tsx` already filters empty translations:
```ts
Object.keys(translations).forEach(code => {
  if (translations[code]?.trim()) {
    nameTranslations[code] = translations[code].trim()
  }
})
```

### Issue: Image upload fails
**Cause:** Content-Type or file size  
**Solution:**
1. Check file is under 5MB
2. Verify backend allows multipart/form-data
3. Check allowed file types: jpg, jpeg, png, gif, webp, bmp

---

## Quick Debugging Checklist

When something doesn't work:

1. ✅ Check browser console for errors
2. ✅ Check network tab for failed requests
3. ✅ Verify `.env.local` has correct API URL
4. ✅ Confirm backend is running and reachable
5. ✅ Try clearing localStorage and cookies
6. ✅ Restart dev server (`npm run dev`)
7. ✅ Check backend logs for errors
8. ✅ Verify API response format matches expected structure
9. ✅ Test API endpoint directly with curl or Postman
10. ✅ Check CORS headers in network response

---

## Getting Help

### Debug Mode
Add to your API calls:
```ts
try {
  const res = await api.get('/endpoint')
  console.log('Response:', res.data)
} catch (error) {
  console.error('Error details:', error.response?.data)
  console.error('Status:', error.response?.status)
  console.error('Full error:', error)
}
```

### Check Backend Health
```bash
curl -v http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### Verify Token
```bash
# Get token from localStorage in browser console:
localStorage.getItem('aji_access_token')

# Test with curl:
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8080/api/v1/auth/me
```

---

## Still Having Issues?

1. Check `README.md` for full documentation
2. Review `ARCHITECTURE.md` for system design
3. Check `SETUP.md` for step-by-step instructions
4. Review backend logs for errors
5. Test backend endpoints independently
6. Check that all services match `API_INTEGRATION.md` spec
